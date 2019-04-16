import * as events from "events";
import * as iotnxt from "./iotnxtqueue";
import * as _ from "lodash";
import { log } from "../../utils"

export var name = "iotnxt";
export var deviceTrees: any = {};
export var iotnxtqueues: any = {};

import { version } from "../../config";

var file = "/src/plugins/iotnxt/iotnxtserverside.ts"

var enablePackets = false;

export function handlePacket(db: any, packet: any, cb: any) {

  log("handle packet")

  if (enablePackets) {
    iotnxtUpdateDevice(db, packet, (err: Error, result: any) => {
      if (err) console.log(err);
      if (result) {
        cb(packet);
      }
    })
  } else {
    cb(packet);
  }




}

export function init(app: any, db: any, eventHub: events.EventEmitter) {
  // INITIALIZE ROUTES

  app.post("/api/v3/iotnxt/addgateway", (req: any, res: any) => {
    addgateway(db, req.body, (err: Error, result: any) => {
      if (err) res.json({ err: err.toString() });
      connectgateway(db, req.body, eventHub, (errC: any, resultC: any) => { })
      res.json(result);
    });
  });

  app.post("/api/v3/iotnxt/removegateway", (req: any, res: any) => {
    if (req.user.level < 100) { res.json({ err: "permission denied" }); return; }
    removegateway(db, req.body, (err: Error, result: any) => {
      if (err) res.json({ err: err.toString() });
      res.json(result);
    });
  });

  app.get("/api/v3/iotnxt/gateways", (req: any, res: any) => {
    getgateways(db, (err: Error, gateways: any) => {
      if (err) res.json({ err: err.toString() });

      for (var g in gateways) {
        delete gateways[g].Secret
      }

      res.json(gateways);
    });
  });

  app.post("/api/v3/iotnxt/setgatewayserverdefault", (req: any, res: any) => {
    if (req.user.level < 100) { res.json({ err: "permission denied" }); return; }
    setgatewayserverdefault(db, req.body, req.user, (err: Error, result: any) => {
      if (err) res.json({ err: err.toString() });
      res.json(result);
    });
  });

  app.get("/api/v3/iotnxt/cleargatewayaccountdefault", (req: any, res: any) => {
    cleargatewayaccountdefault(db, req.user, (err: Error, result: any) => {
      if (err) res.json({ err: err.toString() });
      res.json(result);
    })
  })

  app.post("/api/v3/iotnxt/setgatewayaccountdefault", (req: any, res: any) => {
    setgatewayaccountdefault(db, req.body, req.user, (err: Error, result: any) => {
      if (err) res.json({ err: err.toString() });
      res.json(result);
    })
  })

  app.post("/api/v3/iotnxt/setgatewaydevice", (req: any, res: any) => {
    var gateway = {
      GatewayId: req.body.GatewayId,
      HostAddress: req.body.HostAddress
    }
    setgatewaydevice(db, req.body.key, req.user.level, req.user.apikey, req.body.id, gateway, (err: Error, result: any) => {
      res.json(result);
    })
  });




  // getgateways(db, (err: Error, gateways: any) => {
  //   if (gateways) {
  //     for (var g in gateways) {
  //       updategateway(db,gateways[g],{connected:false, error: err},()=>{})
  //     }
  //   }
  // });






  // CONNECT ALL GATEWAYS AT INIT
  log("IOTNXT Connecting queues.")
  getgateways(db, (err: Error, gateways: any) => {
    if (gateways) {
      for (var g in gateways) {
        connectgateway(db, gateways[g], eventHub, (err: any, result: any) => { })
      }
    }
  });

  //retry every now and then
  setInterval(() => {
    log("IOTNXT auto retry gateways.")
    getgateways(db, (err: Error, gateways: any) => {
      if (gateways) {
        for (var g in gateways) {
          if (gateways[g].connected == false) {
            connectgateway(db, gateways[g], eventHub, (err: any, result: any) => { })
          }
        }
      }
    });
  }, 60 * 1000 * 5) // 5minutes

  // enable packets after 5 seconds.
  setTimeout(() => {
    log("IOTNXT Enabling packets.")
    enablePackets = true;
  }, 5000)



  // RETRY EVERY 10 SECONDS
  // setInterval(()=>{
  //   getgateways(db, (err: Error, gateways: any) => {
  //     if (gateways) {
  //       for (var g in gateways) {        
  //         if (gateways[g].connected === false) {
  //           connectgateway(db, gateways[g], eventHub, (err:any, result:any)=>{ })
  //         }          
  //       }
  //     }
  //   });
  // },10000)
}


function connectgateway(db: any, gatewayToconnect: any, eventHub: any, cb: any) {
  log("IOTNXT Connecting to " + gatewayToconnect.GatewayId)
  calcDeviceTree(db, gatewayToconnect, (gateway: any, deviceTree: any) => {
    //console.log("deviceTree done.")
    deviceTrees[gateway.GatewayId + "|" + gateway.HostAddress] = _.clone(deviceTree);
    connectIotnxt(deviceTree, gateway, (err: Error, iotnxtqueue: any) => {
      if (err) {
        eventHub.emit("plugin", { plugin: "iotnxt", event: "connect", connected: false, gateway: gateway })
        updategateway(db, gateway, { connected: false, error: err }, () => { })
      }
      if (iotnxtqueue) {

        var identifier = gateway.GatewayId + "|" + gateway.HostAddress
        iotnxtqueues[identifier] = iotnxtqueue;
        log("IOTNXT CONNECTED [" + iotnxtqueue.GatewayId + "]");
        updategateway(db, gateway, { connected: true, error: "" }, () => { })

        eventHub.emit("plugin", {
          plugin: "iotnxt",
          event: "connect",
          connected: true,
          gateway: gateway
        });

        /////////
        iotnxtqueue.on("disconnect", () => {
          updategateway(db, gateway, { connected: false }, () => { })
          eventHub.emit("plugin", {
            plugin: "iotnxt",
            event: "disconnect",
            connected: false,
            gateway: gateway
          });
        })

        /////////




        iotnxtqueue.on("request", (request: any) => {

          for (var key in request.deviceGroups) {
            if (request.deviceGroups.hasOwnProperty(key)) {
              var apikey = key.split(":")[0].split("|")[0]
              var requestClean: any = {}
              requestClean.id = key.split(":")[1].split("|")[0]
              requestClean.req = request.deviceGroups[key];

              var meta = { ip: "", userAgent: "iotnxtQueue", method: "REQ" }

              if (!requestClean.data) {
                requestClean.data = {};
              }

              requestClean.meta = meta;

              var deviceData = { apikey: apikey, packet: requestClean }


              eventHub.emit("device", { apikey: apikey, packet: requestClean })

            }
          }


        });



      }

    });
  }
  );
}


function addgateway(db: any, gateway: any, cb: any) {
  gateway.default = false; // defaults to not the default
  gateway.connected = false;
  gateway.unique = generateDifficult(64);
  gateway.type = "gateway"
  db.plugins_iotnxt.save(gateway, (err: Error, result: any) => { cb(err, result); });
}

function getgateways(db: any, cb: any) {
  db.plugins_iotnxt.find({ type: "gateway" }, (err: Error, data: any) => {
    if (err) {
      console.error("iotnxt plugin cannot get gateways");
      cb(err, undefined);
    }

    if (data == null) {
      cb(undefined, []);
    } else {
      cb(undefined, data);
    }
  });
}

function getserverdefaultgateway(db: any, cb: any) {
  db.plugins_iotnxt.findOne({ type: "gateway", default: true }, (err: Error, data: any) => {
    if (err) {
      console.error("iotnxt plugin cannot get gateways");
      cb(err, undefined);
    }

    if (data == null) {
      cb(undefined, []);
    } else {
      cb(undefined, data);
    }
  });
}

function removegateway(db: any, data: any, cb: any) {

  db.plugins_iotnxt.remove({ type: "gateway", GatewayId: data.GatewayId, HostAddress: data.HostAddress }, cb);

}



function setgatewayserverdefault(db: any, gateway: any, user: any, cb: any) {
  if (user.level > 50) {
    db.plugins_iotnxt.update({ type: "gateway", default: true }, { "$set": { default: false } }, (err: Error, result: any) => {
      db.plugins_iotnxt.update(
        { type: "gateway", GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress },
        { "$set": { default: true } }, (err: Error, resultUpd: any) => {
          if (err) { cb(err, undefined); }
          if (resultUpd) { cb(undefined, resultUpd); }
        });
    });
  } else {
    cb({ err: "permission denied. user level too low" })
  }

}

// clears user default gateway
function cleargatewayaccountdefault(db: any, user: any, cb: any) {
  db.users.update({ apikey: user.apikey }, { "$unset": { "plugins_iotnxt_gatewaydefault": 1 } }, (err: Error, resultUpd: any) => {
    if (err) cb(err, undefined);
    if (resultUpd) { cb(undefined, resultUpd); }
  })
}

// this updates user default gateway 
function setgatewayaccountdefault(db: any, gateway: any, user: any, cb: any) {
  db.users.update({ apikey: user.apikey },
    {
      "$set": {
        "plugins_iotnxt_gatewaydefault":
          { GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress }
      }
    }, (err: Error, resultUpd: any) => {
      if (err) cb(err, undefined);
      if (resultUpd) { cb(undefined, resultUpd); }
    })
}

function setgatewaydevice(db: any, key: any, level: any, apikey: string, id: string, gateway: any, cb: any) {
  if (level > 0 && level < 100) {
    db.states.update({ $and: [{ devid: id, apikey: apikey }] },
      {
        "$set": {
          "plugins_iotnxt_gateway": {
            GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress
          }
        }
      }, cb)
  }
  else if (level >= 100) {
    db.states.update({ $and: [{ devid: id, key: key }] },
      {
        "$set": {
          "plugins_iotnxt_gateway": {
            GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress
          }
        }
      }, cb)
  }
}

function updategateway(db: any, gateway: any, update: any, cb: any) {
  db.plugins_iotnxt.update(
    { type: "gateway", GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress },
    { "$set": update }, (err: Error, result: any) => {
      if (err) { cb(err, undefined); }
      if (result) { cb(err, result); }
    })
}

// Calculates the device object for iotnxt queue registration
function calcDeviceTree(db: any, gateway: any, cb: any) {
  getgateways(db, (err: Error, gateways: any) => {
    if (gateways) {
      var deviceTree: any = {};
      var results = 0;
      db.states.find({}, (err: Error, deviceStates: any[]) => {
        if (deviceStates.length == 0) {
          cb(gateway, {})
        }
        else {
          for (var curdev in deviceStates) {
            findDeviceGateway(db, deviceStates[curdev].apikey, deviceStates[curdev].devid, (device: any, deviceGateway: any) => {

              results++;


              if ((deviceGateway) && (gateway)) {
                if (gateway.GatewayId == deviceGateway.GatewayId) {
                  var flatdata = recursiveFlat(device.payload.data);
                  var Properties: any = {};
                  for (var key in flatdata) {
                    if (flatdata.hasOwnProperty(key)) {
                      Properties[key] = {
                        PropertyName: key,
                        DataType: null
                      };
                    }
                  }
                  deviceTree[device.apikey + "|1:" + device.devid + "|1"] = {
                    Make: null,
                    Model: null,
                    DeviceName: device.apikey + "|1:" + device.devid + "|1",
                    DeviceType: device.devid,
                    Properties: Properties
                  };
                  //end if
                }
              }



              //console.log("results:"+results+" deviceStates.length:"+deviceStates.length)
              if (results == deviceStates.length) {
                cb(gateway, deviceTree);
              }

            }
            );
          } //for
        }



      });
    }
  });
}

// callsback with this device's gateway
export function findDeviceGateway(db: any, apikey: string, devid: string, cb: any) {

  db.states.findOne({ apikey: apikey, devid: devid }, (e: Error, deviceState: any) => {

    if (deviceState == null) { cb(new Error("no device")); return; }

    if (deviceState.plugins_iotnxt_gateway) {
      cb(deviceState, deviceState.plugins_iotnxt_gateway);
    } else {
      cb(undefined, undefined);
      //check account setting
      // db.users.findOne({ apikey: apikey },(err: Error, user: any) => {

      //   if (user == null) { 

      //     cb(undefined, undefined);
      //       // getserverdefaultgateway(db, (err:Error,defaultgateway:any)=>{
      //       //   cb(deviceState, defaultgateway); //first in config serverwide
      //       // })          

      //     }

      //     if (user) {
      //       if (user.plugins_iotnxt_gatewaydefault) {
      //         //account has gateway set
      //         cb(deviceState, user.plugins_iotnxt_gatewaydefault);
      //       } else {
      //         //account has no gateway set
      //         getserverdefaultgateway(db, (err:Error,defaultgateway:any)=>{
      //           cb(deviceState, defaultgateway); //first in config serverwide
      //         })          
      //       }
      //     }


      //   }
      // );
    }
  })
}

export function recursiveFlat(inObj: any) {
  var res: any = {};

  (function recurse(obj, current) {
    for (var key in obj) {
      var value = obj[key];
      var newKey: any = current ? current + "." + key : key; // joined key with dot
      if (value && typeof value === "object") {
        recurse(value, newKey); // it's a nested object, so do it again
      } else {
        res[newKey] = value; // it's not an object, so set the property
      }
    }
  })(inObj);

  return res;
}

function connectIotnxt(deviceTree: any, gateway: any, cb: any) {
  log("IOTNXT CONNECTING GATEWAY: [" + gateway.GatewayId + "]");

  if (gateway.HostAddress == undefined) {
    console.error("ERROR gateway.HostAddress undefined");
  }



  var iotnxtqueue = new iotnxt.IotnxtQueue(
    {
      GatewayId: gateway.GatewayId,
      secretkey: gateway.Secret,
      FirmwareVersion: version.version,
      Make: "IoT.nxt",
      Model: version.description,
      id: "rouanApi",
      publickey: gateway.PublicKey,
      hostaddress: gateway.HostAddress
    },
    deviceTree,
    true
  );

  iotnxtqueue.on('error', (err) => {
    console.log(err);
  })

  iotnxtqueue.on("error", (err) => {
    log({ err, gateway })
  })

  iotnxtqueue.on("connect", () => { cb(undefined, iotnxtqueue); });

  iotnxtqueue.on("disconnect", () => { });
}

function iotnxtUpdateDevice(db: any, packet: any, cb: any) {
  //console.log(Date.now() + " " + packet.apikey + " " + packet.devid )

  if (packet.apikey == undefined) {
    console.log("---->")
    console.log(packet)
    return;
  }

  findDeviceGateway(db, packet.apikey, packet.devid, (deviceState: any, gateway: any) => {

    // console.log("----")
    //  console.log(deviceState);
    //  console.log(gateway);

    if ((deviceState) && (gateway)) {
      calcDeviceTree(db, gateway, (gateway: any, deviceTree: any) => {

        var gatewayIdent = gateway.GatewayId + "|" + gateway.HostAddress

        if (deviceTrees[gatewayIdent]) {

          //console.log(deviceTrees)

          var diff = difference(deviceTree, deviceTrees[gatewayIdent])
          if (_.isEmpty(diff)) {
            //console.log("no need to register new endpoints");
            iotnxtUpdateDevicePublish(gateway, packet, cb);
          } else {
            //console.log("need to register new endpoints");
            if (iotnxtqueues[gatewayIdent]) {
              iotnxtqueues[gatewayIdent].registerEndpoints(deviceTree, (err: Error, result: any) => {
                if (err) console.log(err);

                if (result) {
                  deviceTrees[gatewayIdent] = _.clone(deviceTree);
                  iotnxtUpdateDevicePublish(gateway, packet, cb);
                }
              })

            } else {
              console.log("queue not connected")
            }
            /////////
          }
        }
      });
    }

  })


}

function iotnxtUpdateDevicePublish(gateway: any, packet: any, cb: any) {
  var Route = packet.apikey + "|1:" + packet.devid + "|1";
  var flatdata = recursiveFlat(packet.payload.data);

  var gatewayIdent = gateway.GatewayId + "|" + gateway.HostAddress;

  if (iotnxtqueues[gatewayIdent]) {
    iotnxtqueues[gatewayIdent].clearState();
    for (var propertyName in flatdata) {
      if (flatdata.hasOwnProperty(propertyName)) {

        if (typeof flatdata[propertyName] == "object") {
          iotnxtqueues[gatewayIdent].updateState(
            Route,
            propertyName,
            JSON.stringify(flatdata[propertyName])
          );
        } else {
          iotnxtqueues[gatewayIdent].updateState(
            Route,
            propertyName,
            flatdata[propertyName]
          );
        }
      }
    }
    iotnxtqueues[gateway.GatewayId + "|" + gateway.HostAddress].publishState(cb);
  } else {
    //console.log("QUEUE UNDEFINED")
  }
}





function generateDifficult(count: number) {
  var _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  var str = '';
  for (var i = 0; i < count; i++) {
    var tmp = _sym[Math.round(Math.random() * (_sym.length - 1))];
    str += "" + tmp;
  }
  return str;
}

export function difference(object: any, base: any) {

  if (typeof object !== "object") { object = {} }
  if (typeof base !== "object") { base = {} }

  function changes(object: any, base: any) {
    return _.transform(object, function (result: any, value: any, key: any) {
      if (!_.isEqual(value, base[key])) {
        result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
      }
    });
  }

  return changes(object, base);
}