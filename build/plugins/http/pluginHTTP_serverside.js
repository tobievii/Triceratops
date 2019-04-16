"use strict";
exports.__esModule = true;
var net = require("net");
var utils_1 = require("../../utils");
exports.serversMem = {};
exports.name = "HTTP";
function init(app, db, eventHub) {
    app.get("/api/v3/http/routes", function (req, res) {
        getroutes(db, function (err, routes) {
            if (err)
                res.json({ err: err.toString() });
            res.json(routes);
        });
    });
    app.post("/api/v3/http/setapikey", function (req, res) {
        console.log("--..");
        console.log(req.body);
        db.plugins_http.update({ portNum: req.body.portNum }, { $set: { apikey: req.user.apikey } }, function (err, resultUpd) {
            if (err) {
                res.json(err);
            }
            if (resultUpd) {
                res.json(resultUpd);
            }
        });
    });
    app.post("/api/v3/http/addroute", function (req, res) {
        if (req.user.level < 100) {
            res.json({ err: "permission denied" });
            return;
        }
        req.body.route = utils_1.generateDifficult(32);
        addroute(db, req.body, req.user.apikey, function (err, result) {
            if (err) {
                res.json({ err: err.toString() });
            }
            else {
                listenRoute(app, result, eventHub);
                res.json(result);
            }
        });
    });
    app.post("/api/v3/http/removeroute", function (req, res) {
        req.body.apikey = req.user.apikey;
        removeroute(db, req.body, function (err, result) {
            if (err)
                res.json({ err: err.toString() });
            res.json(result);
        });
    });
    // CONNECT ROUTES!
    getroutes(db, function (err, routes) {
        if (routes) {
            for (var _i = 0, routes_1 = routes; _i < routes_1.length; _i++) {
                var route = routes_1[_i];
                ///////
                listenRoute(app, route, eventHub);
                ////////////
            }
        }
    });
}
exports.init = init;
function listenRoute(app, route, eventHub) {
    app[route.method]("/plugin/http/" + route.route, function (req, res) {
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
        res.end("success");
    });
}
exports.listenRoute = listenRoute;
function getroutes(db, cb) {
    db.plugins_http.find({}, cb);
}
exports.getroutes = getroutes;
function addroute(db, routeOptions, apikey, cb) {
    routeOptions.apikey = apikey;
    db.plugins_http.find({ route: routeOptions.route, method: routeOptions.method, apikey: apikey }, function (err, conflictingroutes) {
        if (err)
            console.log(err);
        if (conflictingroutes.length == 0) {
            db.plugins_http.save(routeOptions, cb);
        }
        else {
            cb(new Error("route already taken"), undefined);
        }
    });
}
exports.addroute = addroute;
function removeroute(db, routeOptions, cb) {
    db.plugins_http.remove({ route: routeOptions.route, method: routeOptions.method }, cb);
}
exports.removeroute = removeroute;
function updateport(db, portNum, update, cb) {
    db.plugins_http.update({ portNum: portNum }, { $set: update }, cb);
}
exports.updateport = updateport;
function connectport(db, routeOptions, eventHub, cb) {
    console.log("http Server " + routeOptions.portNum + " \t| loading...");
    var server = net.createServer(function (client) {
        server.getConnections(function (err, count) {
            console.log("There are %d connections now. ", count);
            updateport(db, routeOptions.portNum, { connections: count }, function (err, result) { });
            eventHub.emit("plugin", { plugin: "http", event: "connections" });
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        client.on("data", function (data) {
            console.log(data);
            eventHub.emit("device", {
                //apikey: config.apikey,
                apikey: "mfradh6drivbykz7s4p3vlyeljb8666v",
                packet: {
                    id: "httpPort" + routeOptions.portNum,
                    level: 1,
                    data: { text: data.toString().replace("\r\n", "") },
                    http: { hexBuffer: data.toString("hex") },
                    routeOptions: routeOptions,
                    meta: { method: "http" }
                }
            });
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        client.on("end", function () {
            // Get current connections count.
            server.getConnections(function (err, count) {
                console.log("There are %d connections now. ", count);
                updateport(db, routeOptions.portNum, { connections: count }, function (err, result) { });
            });
            eventHub.emit("plugin", { plugin: "http", event: "connections" });
        });
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    });
    server.listen(routeOptions.portNum, function () {
        console.log("http Server " + routeOptions.portNum + " \t| ready.");
    });
    server.on("close", function () {
        console.log("http server socket is closed.");
    });
    server.on("error", function (error) {
        console.error(JSON.stringify(error));
    });
    exports.serversMem[routeOptions.portNum] = server;
}
exports.connectport = connectport;
