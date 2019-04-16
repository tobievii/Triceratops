"use strict";
exports.__esModule = true;
var net = require("net");
exports.serversMem = {};
exports.name = "tcp";
function init(app, db, eventHub) {
    app.get("/api/v3/tcp/ports", function (req, res) {
        db.plugins_tcp.find({}, function (err, ports) {
            if (err) {
                res.json(err);
                return;
            }
            res.json(ports);
        });
        // getports(db, (err: Error, ports: any) => {
        //   if (err) res.json({ err: err.toString() });
        //   var cleanports:any = []
        //   for (var p in ports) {
        //     //delete ports[p].apikey
        //     if (ports[p].apikey == req.user.apikey) {
        //       // keep the apikey
        //       ports[p].apikey = true
        //     } else {
        //       ports[p].apikey = false
        //     } 
        //     // cleanports
        //   }      
        //   res.json(ports);
        // });
    });
    app.post("/api/v3/tcp/setapikey", function (req, res) {
        console.log("--..");
        console.log(req.body);
        db.plugins_tcp.update({ portNum: req.body.portNum }, { $set: { apikey: req.user.apikey } }, function (err, resultUpd) {
            if (err) {
                res.json(err);
            }
            if (resultUpd) {
                res.json(resultUpd);
            }
        });
    });
    app.post("/api/v3/tcp/addport", function (req, res) {
        if (req.user.level < 100) {
            res.json({ err: "permission denied" });
            return;
        }
        var port = req.body;
        port.apikey = req.user.apikey;
        addport(db, port, function (err, result) {
            if (err) {
                res.json({ err: err.toString() });
            }
            else {
                connectport(db, port, eventHub, function (err, result) {
                    res.json(result);
                });
            }
        });
    });
    app.post("/api/v3/tcp/removeport", function (req, res) {
        if (req.user.level < 100) {
            res.json({ err: "permission denied" });
            return;
        }
        removeport(db, req.body, function (err, result) {
            if (err)
                res.json({ err: err.toString() });
            res.json(result);
        });
    });
    getports(db, function (err, ports) {
        if (ports) {
            for (var p in ports) {
                connectport(db, ports[p], eventHub, function (err, result) { });
            }
        }
    });
}
exports.init = init;
function getports(db, cb) {
    db.plugins_tcp.find({}, cb);
}
exports.getports = getports;
function addport(db, portOptions, cb) {
    if (portOptions.portNum < 1000) {
        cb(new Error("portNum can not be in the range 0-1000"), undefined);
        return;
    }
    db.plugins_tcp.find({ portNum: portOptions.portNum }, function (err, conflictingPorts) {
        if (err)
            console.log(err);
        if (conflictingPorts.length == 0) {
            db.plugins_tcp.save(portOptions, cb);
        }
        else {
            cb(new Error("portNum already taken"), undefined);
        }
    });
}
exports.addport = addport;
function removeport(db, portOptions, cb) {
    db.plugins_tcp.remove({ portNum: portOptions.portNum }, cb);
}
exports.removeport = removeport;
function updateport(db, portNum, update, cb) {
    db.plugins_tcp.update({ portNum: portNum }, { $set: update }, cb);
}
exports.updateport = updateport;
function connectport(db, portOptions, eventHub, cb) {
    console.log("TCP Server " + portOptions.portNum + " \t| loading...");
    var server = net.createServer(function (client) {
        server.getConnections(function (err, count) {
            console.log("There are %d connections now. ", count);
            updateport(db, portOptions.portNum, { connections: count }, function (err, result) { });
            eventHub.emit("plugin", { plugin: "tcp", event: "connections" });
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        client.on("data", function (data) {
            //console.log(data);
            eventHub.emit("device", {
                //apikey: config.apikey,
                apikey: portOptions.apikey,
                packet: {
                    id: "tcpPort" + portOptions.portNum,
                    level: 1,
                    data: { text: data.toString().replace("\r\n", "") },
                    tcp: { hexBuffer: data.toString("hex") },
                    portOptions: portOptions,
                    meta: { method: "tcp" }
                }
            });
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        client.on("end", function () {
            // Get current connections count.
            server.getConnections(function (err, count) {
                console.log("There are %d connections now. ", count);
                updateport(db, portOptions.portNum, { connections: count }, function (err, result) { });
            });
            eventHub.emit("plugin", { plugin: "tcp", event: "connections" });
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    });
    server.listen(portOptions.portNum, function () {
        console.log("TCP Server " + portOptions.portNum + " \t| ready.");
        cb(undefined, portOptions);
    });
    server.on("close", function () {
        console.log("TCP server socket is closed.");
    });
    server.on("error", function (error) {
        console.error(JSON.stringify(error));
    });
    exports.serversMem[portOptions.portNum] = server;
}
exports.connectport = connectport;
