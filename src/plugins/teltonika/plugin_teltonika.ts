var net = require("net");

import * as events from "events";
import { Teltonika } from "./lib_teltonika"
import { log } from "../../log"
import { asyncdb } from "../../utils"

export const name = "teltonika";
export const collection = "plugins_" + name;

export const minPort = 12001;
export const maxPort = 12200;

export var init = async (app: any, db: any, eventHub: events.EventEmitter) => {
  //default 12000 port should handle any device for any account

  app.get("/api/v3/teltonika/info", handleReqInfo(db));
  app.get("/api/v3/teltonika/reqport", handleReqPort(db, minPort, maxPort, eventHub));

  // app.get("/api/v3/teltonika/reqport", (req: any, res: any) => {
  //   console.log("REQ PORT")

  //   // check account for port
  //   db.plugins_teltonika.find({ apikey: req.user.apikey }, (e, r) => {
  //     //console.log([e, r])
  //     //res.json([e, r]);
  //     if (r.length == 0) {
  //       //-----------
  //       db.plugins_teltonika.save({apikey:req.user.apikey, })
  //       //-----------
  //     }
  //   })

  // })

  // connectPort(db, 12000, () => { })

  var userPorts: any = await findPorts(db);
  for (var userPort of userPorts) {
    connectPort(userPort, eventHub);
  }
}



export function handleReqInfo(db: any) {
  return async (req: any, res: any) => {
    var found: any = await asyncdb.findOne(db, collection, { apikey: req.user.apikey })
    if (found.err) { res.json(found.err); }
    delete found.result.apikey;
    delete found.result["_id"]
    res.json(found.result);
  }
}

export function handleReqPort(db: any, minPort: number, maxPort: number, eventHub: any) {
  return async (req: any, res: any) => {
    // check if account has port assigned
    var found: any = await asyncdb.find(db, collection, { apikey: req.user.apikey })
    if (found.err) { res.json(found.err); }

    if (found.result.length == 0) {
      // no ports yet
      // find open port
      var openport: any = await findOpenPort(db, minPort, maxPort);
      // asign to account
      var port = await registerPort(db, req.user, openport);

      connectPort(port, eventHub);

      res.json(port);
    } else {
      res.json({ error: "account already has port assigned", port: found.result[0].port })
    }
  }
}

export function findOpenPort(db: any, minPort: number, maxPort: number) {
  return new Promise((resolve: any, reject: any) => {
    db[collection].find({}, (e: Error, r: any) => {
      var ports = []
      for (var p of r) {
        ports.push(p.port);
      }


      //sort ascending
      ports.sort((a, b) => { if (b < a) { return 1 } else return -1 });

      //find first unused

      for (var m = minPort; m < maxPort; m++) {
        if (ports.indexOf(m) == -1) {
          resolve(m);
        }
      }
    })
  });
}

export function findPorts(db: any) {
  return new Promise((resolve: any, reject: any) => {
    db[collection].find({}, (e: Error, r: any) => {
      if (e) { reject(e); }
      resolve(r);
    })
  });
}


export function registerPort(db: any, user: any, port: number) {
  return new Promise((resolve: any, reject: any) => {
    db[collection].save({ apikey: user.apikey, port }, (e: Error, r: any) => {
      if (e) { reject(e); }
      resolve(r);
    })
  });
}

export function connectPort(userPort: any, eventHub: any) {
  var server = net.createServer((client: any) => {
    var device = new Teltonika(client, {});
    device.on("data", (data: any) => {
      console.log(data);
      eventHub.emit("device", {
        apikey: userPort.apikey,
        packet: { id: data.id, data: data.data, meta: { method: "teltonika" } }
      })
    })
  })

  server.listen(userPort.port, () => {
    log("PLUGIN", name, "listening on " + userPort.port)
  })
}