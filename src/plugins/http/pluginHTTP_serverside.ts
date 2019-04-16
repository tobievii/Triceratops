var net = require("net");
import * as events from "events";
import { generate, generateDifficult } from "../../utils";

export var serversMem: any = {};

export const name = "HTTP"

export function init(app: any, db: any, eventHub: events.EventEmitter) {
  app.get("/api/v3/http/routes", (req: any, res: any) => {

    getroutes(db, (err: Error, routes: any) => {
      if (err) res.json({ err: err.toString() });


      res.json(routes);
    });
  });

  app.post("/api/v3/http/setapikey", (req: any, res: any) => {
    console.log("--..")
    console.log(req.body);

    db.plugins_http.update(
      { portNum: req.body.portNum },
      { $set: { apikey: req.user.apikey } },
      (err: Error, resultUpd: any) => {
        if (err) { res.json(err) }
        if (resultUpd) {
          res.json(resultUpd)
        }
      }
    );

  })

  app.post("/api/v3/http/addroute", (req: any, res: any) => {
    if (req.user.level < 100) {
      res.json({ err: "permission denied" });
      return;
    }

    req.body.route = generateDifficult(32);

    addroute(db, req.body, req.user.apikey, (err: Error, result: any) => {
      if (err) {
        res.json({ err: err.toString() });
      } else {
        listenRoute(app, result, eventHub);
        res.json(result);


      }
    });
  });

  app.post("/api/v3/http/removeroute", (req: any, res: any) => {
    req.body.apikey = req.user.apikey
    removeroute(db, req.body, (err: Error, result: any) => {
      if (err) res.json({ err: err.toString() });
      res.json(result);
    });
  });

  // CONNECT ROUTES!
  getroutes(db, (err: Error, routes: any) => {
    if (routes) {
      for (var route of routes) {

        ///////
        listenRoute(app, route, eventHub)



        ////////////
      }
    }
  });
}


export function listenRoute(app: any, route: any, eventHub: events.EventEmitter) {
  app[route.method]("/plugin/http/" + route.route, (req: any, res: any) => {
    //console.log(req.body);


    eventHub.emit("device", {
      //apikey: config.apikey,
      apikey: route.apikey,
      packet: {
        id: route.id,
        data: req.body,
        //http: { route: route },
        meta: { method: "http" }
      }
    });

    res.end("success")


  })
}

export function getroutes(db: any, cb: any) {
  db.plugins_http.find({}, cb);
}


export function addroute(db: any, routeOptions: any, apikey: any, cb: any) {

  routeOptions.apikey = apikey;
  db.plugins_http.find({ route: routeOptions.route, method: routeOptions.method, apikey: apikey },
    (err: Error, conflictingroutes: any) => {
      if (err) console.log(err);

      if (conflictingroutes.length == 0) {

        db.plugins_http.save(routeOptions, cb);
      } else {
        cb(new Error("route already taken"), undefined);
      }

    }
  );
}

export function removeroute(db: any, routeOptions: any, cb: any) {
  db.plugins_http.remove({ route: routeOptions.route, method: routeOptions.method }, cb);
}

export function updateport(db: any, portNum: number, update: any, cb: any) {
  db.plugins_http.update({ portNum }, { $set: update }, cb);
}

export function connectport(db: any, routeOptions: any, eventHub: any, cb: any) {
  console.log("http Server " + routeOptions.portNum + " \t| loading...");

  var server = net.createServer((client: any) => {
    server.getConnections(function (err: Error, count: number) {
      console.log("There are %d connections now. ", count);
      updateport(
        db,
        routeOptions.portNum,
        { connections: count },
        (err: Error, result: any) => { }
      );
      eventHub.emit("plugin", { plugin: "http", event: "connections" });
    });

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    client.on("data", (data: any) => {
      console.log(data);
      eventHub.emit("device", {
        //apikey: config.apikey,
        apikey: "mfradh6drivbykz7s4p3vlyeljb8666v",
        packet: {
          id: "httpPort" + routeOptions.portNum,
          level: 1,
          data: { text: data.toString().replace("\r\n", "") },
          http: { hexBuffer: data.toString("hex"), },
          routeOptions,
          meta: { method: "http" }
        }
      });
    });
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    client.on("end", () => {
      // Get current connections count.
      server.getConnections(function (err: Error, count: number) {
        console.log("There are %d connections now. ", count);
        updateport(
          db,
          routeOptions.portNum,
          { connections: count },
          (err: Error, result: any) => { }
        );
      });
      eventHub.emit("plugin", { plugin: "http", event: "connections" });
    });
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  });

  server.listen(routeOptions.portNum, () => {
    console.log("http Server " + routeOptions.portNum + " \t| ready.");
  });

  server.on("close", function () {
    console.log("http server socket is closed.");
  });

  server.on("error", function (error: Error) {
    console.error(JSON.stringify(error));
  });

  serversMem[routeOptions.portNum] = server;
}
