import * as utils from "./utils";
import * as geoip from "geoip-lite";

var _ = require("lodash");

export function postState(
  db: any,
  user: any,
  request: any,
  meta: any,
  cb: Function
) {

  if (!user) {

    //console.log(meta)
    //console.log(request)
    //console.log("user undefined")
    //cb("user undefined", undefined)
    return;
  }



  var event = new Date();
  request.timestamp = event.toJSON();

  var packet: any = {
    "_last_seen": new Date(),
    apikey: user.apikey,
    devid: request.id,
    payload: request,
    meta: {
      user: {
        email: user.email,
        uuid: user.uuid
      },
      created: {
        unix: event.getTime(),
        jsonTime: event.toJSON()
      },
      ip: "",
      ipLoc: {},
      userAgent: meta["User-Agent"],
      uuid: utils.generate(128),
      method: ""
    }
  };

  if (meta.ip) {
    packet.meta.ip = meta.ip;
    packet.meta.ipLoc = geoip.lookup(meta.ip);
    if (packet.meta.ipLoc == undefined || packet.meta.ipLoc == null) {
      packet.meta.ipLoc = {
        ll:
          [
            0.01,
            0.01
          ]
      }
    }
  }

  if (meta.userAgent) {
    packet.meta.userAgent = meta.userAgent;
  }
  if (meta.method) {
    packet.meta.method = meta.method;
  }

  db.states.findOne({ apikey: user.apikey, devid: request.id },
    (findErr: Error, findResult: any) => {
      // if (findResult.notification24 == true) {
      //   db.states.update({ key: findResult.key }, { $unset: { notification24: 1 } }, (err: any, result: any) => {
      //     console.log(result)
      //     console.log(err)
      //   })
      // }
      var packetToUpsert: any = {};

      var info: any = {}
      if (findResult) {
        delete findResult["_id"];

        var mergepacket = true; //default

        if (packet.payload.options) {
          if (packet.payload.options["_merge"] === false) {
            mergepacket = false;
          }
        }

        if (mergepacket) {
          packetToUpsert = _.merge(findResult, packet);
        } else {
          delete findResult.payload; // we clear payload, but retain other data like dashboard and workflow.
          packetToUpsert = _.merge(findResult, packet);
        }


        packetToUpsert["_last_seen"] = new Date();
        info.newdevice = false
      } else {
        packetToUpsert = _.clone(packet);
        packetToUpsert["_last_seen"] = new Date();
        packetToUpsert["_created_on"] = new Date();
        packetToUpsert["key"] = utils.generateDifficult(128);
        packetToUpsert["boundaryLayer"] = undefined;
        packetToUpsert["selectedIcon"] = false;
        info.newdevice = true
      }

      packet["key"] = packetToUpsert.key

      if (packetToUpsert.boundaryLayer != null || packetToUpsert.boundaryLayer != undefined) {
        var bLayer = packetToUpsert.boundaryLayer;
        if (bLayer.length > 0) {
          packet["boundaryLayer"] = packetToUpsert.boundaryLayer;
        }
      }

      db.states.update(
        { apikey: user.apikey, devid: request.id },
        packetToUpsert,
        { upsert: true },
        (errUp: Error, resUp: any) => {

          delete packet["_last_seen"]
          packet["_created_on"] = new Date();
          db.packets.save(packet, (errSave: Error, resSave: any) => {

            // update user account activity timestamp
            db.users.findOne({ apikey: user.apikey }, (e: Error, user: any) => {
              user["_last_seen"] = new Date();
              db.users.update({ apikey: user.apikey }, user, (e2: Error, r2: any) => {
                cb(resSave, info);
              })
            })
          });
        }
      );
    }
  );
}

export function queryProject(
  db: any,
  user: any,
  request: any,
  meta: any,
  cb: Function
) {


  /* ----------------------------------------------------------- 
        PROJECT NEW DATA INTO DB USING PROJECTION
  */
  if (request.data) {
    if (!request.project) { cb({ error: "expected a project parameter. " }); }
    var find = { apikey: user.apikey, devid: request.id };

    db.states.findOne(find, (findErr: Error, state: any) => {
      if (findErr) { cb({ result: "find error" }); }
      if (state) {

        delete state["_id"];


        for (var key in request.project) {
          if (request.project.hasOwnProperty(key)) {


            // simple 1 to 1
            if (request.project[key] == 1) { state.payload.data[key] = request.data[key]; }

            // START COMPLEX

            if (typeof request.project[key] == "object") {


              var matchid = request.project[key].map.indexOf(request.project[key].match)
              var updateid = request.project[key].map.indexOf(request.project[key].update)

              for (var u in request.data[key]) {



                for (var d in state.payload.data[key]) {
                  if (state.payload.data[key][d][request.project[key].match] == request.data[key][u][matchid]) {
                    state.payload.data[key][d].device = request.data[key][u][updateid]
                  }
                }
                //

              }


              postState(db, user, state.payload, meta, (result: any) => {
                cb(result);

              })



            }
            // END COMPLEX

          }
        }





      } else {
        cb({ result: "cannot find id or wrong apikey" });
      }

    });
  }

  /* ----------------------------------------------------------- 
        PROJECT DB DATA DOWN TO A FORMAT
  */
  if (!request.data) {
    var projection: any = { _id: 0 };
    var projectionArrays: any = [];
    // { _id:0, "payload.data.client" : 1 }

    if (request.project) {
      var reqp = request.project;

      for (var key in reqp) {
        if (reqp.hasOwnProperty(key)) {
          //console.log(key + " -> " + reqp[key]);
          if (reqp[key] == 1) {
            projection["payload.data." + key] = 1;
          }

          //projection array
          if (Array.isArray(reqp[key])) {
            projection["payload.data." + key] = 1;
            projectionArrays.push({ key: key, filter: reqp[key] });
          }
          //
        }
      }

      //projection = { payload : { data : request.project }
    }

    db.states.findOne(
      { apikey: user.apikey, "payload.id": request.id },
      projection,
      (err: Error, state: any) => {
        if (state) {


          var response = state.payload.data;

          //IF PROJECT ARRAY
          if (projectionArrays.length > 0) {

            for (var pa of projectionArrays) {

              ////
              for (var a in response[pa.key]) {
                var entry: any = [];
                for (var f of pa.filter) {
                  entry.push(response[pa.key][a][f]);
                }
                response[pa.key][a] = entry;
              }
              ////
            }
          }
          //END IF PROJECT ARRAY

          cb(state.payload.data);
        } else {
          cb({ error: "id not found or invalid apikey" });
        }
      }
    );
  }
  /* ----------------------------------------------------------- */
}





/* ################################################################### */

export function validApiKey(db: any, testkey: string, cb: any) {
  db.users.findOne({ apikey: testkey }, (err: Error, user: any) => {
    if (user) {
      cb(undefined, { testkey: testkey, valid: true, user: user })
    } else {
      cb({ testkey: testkey, valid: false }, undefined)
    }

  })
}


export function getUserByApikey(db: any, apikey: string, cb: any) {
  db.users.findOne({ apikey: apikey }, (err: Error, user: any) => {
    if (user) {
      cb(undefined, user)
    } else {
      cb(err, undefined)
    }

  })
}


export function updateWorkflow(db: any, apikey: string, deviceId: string, workflowCode: string, cb: any) {
  db.states.findOne({ apikey: apikey, devid: deviceId }, (err: Error, state: any) => {
    if (err) cb(err, undefined);
    if (state) {
      state.workflowCode = workflowCode;


      db.states.update({ apikey: apikey, devid: deviceId }, state, { upsert: true }, (err2: Error, resUp: any) => {
        if (err2) cb(err2, undefined);
        if (resUp) cb(undefined, { result: "success" });
      });


    }
  })
}






