"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var utils_1 = require("./utils");
utils_1.log("MAIN \tStart ===============================");
require('source-map-support').install();
var nodemailer = require("nodemailer");
var _ = require('lodash');
var randomString = require('random-string');
var fs = require("fs");
var geoip = require("geoip-lite");
var publicIp = require('public-ip');
var scrypt = require("scrypt");
//var scrypt = require("scrypt");
//var config = JSON.parse(fs.readFileSync('../config.json').toString());
var config_1 = require("./config");
var trex = require("./utils");
var state = require("./state");
//import * as discordBot from './discordBot'
var config = config_1.configGen();
var version = config.version; //
//trex.log(config);
var compression = require('compression');
var express = require("express");
var sprintf = require("sprintf-js").sprintf;
var app = express();
var http = require('http');
var https = require('https');
var cookieParser = require('cookie-parser');
var accounts = require("./accounts");
var events = require("events");
var utilsLib = require("./utils");
var mongojs = require('mongojs');
var VM = require('vm2').VM;
var db = mongojs(config.mongoConnection, config.mongoCollections);
var log_1 = require("./log");
log_1.logDb(db); //pass db instance to logger
var eventHub = new events.EventEmitter();
var config_2 = require("./plugins/config");
var stats = require("./stats");
app.disable('x-powered-by');
app.use(cookieParser());
app.use(compression());
app.use(express.static('../public'));
app.use(express.static('../client'));
app.use(express.static('../client/dist'));
app.use('/view', express.static('../client/dist'));
app.use('/u/:username/view', express.static('../client/dist'));
//####################################################################
// PLUGINS
eventHub.on("device", function (data) {
    //log("----")
    handleDeviceUpdate(data.apikey, data.packet, { socketio: true }, function (e, r) { });
});
eventHub.on("plugin", function (data) {
    io.sockets.emit('plugin', data);
});
//app.use(express.json())
app.use(safeParser);
//FIRST RUN
// OLD: accounts.defaultAdminAccount(db);
utilsLib.checkFirstRun(db);
utilsLib.createUsernamesForOldAccounts(db);
utilsLib.createDeviceKeysForOldAccounts(db);
//handle accounts/cookies.
app.use(accounts.midware(db));
db.on('connect', function () {
    for (var p in config_2.plugins) {
        if (config_2.plugins[p].init) {
            utils_1.log("PLUGIN\tinit [" + config_2.plugins[p].name + "]");
            config_2.plugins[p].init(app, db, eventHub);
        }
    }
});
//####################################################################
// USERS LAST SEEN / ACTIVE
app.use(function (req, res, next) {
    if (req.user) {
        if (req.user.level == 0) {
            utils_1.log("USER\tunregistered" + "\t" + req.url);
        }
        db.users.findOne({ apikey: req.user.apikey }, function (e, user) {
            user["_last_seen"] = new Date();
            db.users.update({ apikey: req.user.apikey }, user, function (e2, r2) {
                next();
            });
        });
    }
    else {
        next();
    }
});
//####################################################################
app.get('/', function (req, res) {
    //redirect main page people to https.
    if (req.protocol == "http") {
        trex.log("HTTP VISITOR");
        if (config.ssl) {
            res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
            res.end();
        }
    }
    if (req.user) {
        if (req.user.level > 0) {
            fs.readFile('../public/react.html', function (err, data) {
                res.end(data.toString());
            });
        }
        else {
            fs.readFile('../public/react.html', function (err, data) {
                res.end(data.toString());
            });
        }
    }
    else {
        res.end("AN ERROR HAS OCCURED. ARE COOKIES ENABLED?");
    }
});
stats.init(app, db);
app.get('/admin/accounts', function (req, res) {
    fs.readFile('../public/admin_accounts.html', function (err, data) {
        res.end(data.toString());
    });
});
app.get("/recover/:recoverToken", function (req, res) {
    fs.readFile('../public/react.html', function (err, data) {
        res.end(data.toString());
    });
});
app.get("/accounts/secure", function (req, res) {
    fs.readFile('../public/react.html', function (err, data) {
        res.end(data.toString());
    });
});
app.get('/signout', function (req, res) {
    res.clearCookie("uuid");
    res.redirect('/');
});
app.post('/signin', accounts.signInFromWeb(db));
app.get("/u/:username", function (req, res) {
    fs.readFile('../public/react.html', function (err, data) {
        res.end(data.toString());
    });
});
var webpush = require("web-push");
var publicVapidKey = "BNOtJNzlbDVQ0UBe8jsD676zfnmUTFiBwC8vj5XblDSIBqnNrCdBmwv6T-EMzcdbe8Di56hbZ_1Z5s6uazRuAzA";
var privateVapidKey = "IclWedYTzNBuMaDHjCjA1B5km-Y3NAxTGbxR7BqhU90";
webpush.setVapidDetails("mailto:DeepaSoul.sa@gmail.com", publicVapidKey, privateVapidKey);
app.post("/subscribe", function (req, res) {
    // Get pushSubscription object
    var subscription = req.body;
    // Send 201 - resource created
    res.status(201).json({});
    // Create payload
    var payload = JSON.stringify({ title: "Push Test" });
    // Pass object into sendNotification
    webpush
        .sendNotification(subscription, payload)
        .then(function (response) {
        // io.to(req.user.apikey).emit('pushNotification', { title: "Push Test" })
    })["catch"](function (err) { return console.error(err); });
});
app.get("/u/:username/view/:devid", function (req, res) {
    fs.readFile('../public/react.html', function (err, data) {
        res.end(data.toString());
    });
});
app.get("/notifications", function (req, res) {
    fs.readFile('../public/react.html', function (err, data) {
        res.end(data.toString());
    });
});
app.get('/settings', function (req, res) {
    fs.readFile('../public/react.html', function (err, data) {
        res.end(data.toString());
    });
});
app.get('/view/:id', function (req, res) {
    trex.log("client is viewing: " + JSON.stringify(req.params));
    fs.readFile('../public/react.html', function (err, data) {
        res.end(data.toString());
    });
});
app.get('/view/:id/:mode', function (req, res) {
    trex.log("client is viewing: " + JSON.stringify(req.params));
    fs.readFile('../public/react.html', function (err, data) {
        res.end(data.toString());
    });
});
app.get('/fbp', function (req, res) {
    trex.log("fbp:");
    fs.readFile('../public/react.html', function (err, data) {
        res.end(data.toString());
    });
});
app.get('/api/v3/version', function (req, res) {
    res.json(version);
});
app.get('/api/v3/account', function (req, res) {
    var cleanUser = _.clone(req.user);
    delete cleanUser.password;
    res.json(cleanUser);
});
app.get('/api/v3/account/stats', function (req, res) {
    stats.accountStats(req.user, function (err, stats) {
        if (err) {
            res.json(err);
        }
        res.json(stats);
    });
});
// This is to update the workflow on a device.
app.post("/api/v3/workflow", function (req, res) {
    if (req.body) {
        trex.log("WORKFLOW UPDATE");
        state.updateWorkflow(db, req.user.apikey, req.body.id, req.body.code, function (err, result) {
            if (err)
                res.json(err);
            if (result)
                res.json(result);
        });
    }
    else {
        trex.log("WORKFLOW API ERROR");
    }
});
app.post("/api/v3/packets", function (req, res, next) {
    if (!req.user) {
        res.json({ error: "user not authenticated" });
        return;
    }
    var resolved = false;
    // find history by key
    if (req.body.key) {
        resolved = true;
        db.states.findOne({ key: req.body.key }, function (e, device) {
            if (req.body.datapath) {
                var query = { apikey: device.apikey, devid: device.devid };
                query["payload." + req.body.datapath] = { $exists: true };
                var result = [];
                db.packets.find(query).sort({ "_id": -1 }).limit(50, function (packetError, rawpackets) {
                    if (packetError) {
                        res.json(packetError);
                        console.log(packetError);
                    }
                    var packets = [];
                    for (var p in rawpackets) {
                        var found = 0;
                        for (var o in packets) {
                            if (rawpackets[p]["_created_on"] == packets[o]["_created_on"]) {
                                found++;
                            }
                        }
                        if (found == 0) {
                            packets.push(rawpackets[p]);
                        }
                    }
                    for (var _i = 0, packets_1 = packets; _i < packets_1.length; _i++) {
                        var pa = packets_1[_i];
                        var clean = {};
                        //clean[req.body.datapath] = _.get(p, "payload." + req.body.datapath, "notfound");
                        //clean["_created_on"] = p["_created_on"]
                        clean["x"] = pa["_created_on"];
                        clean["y"] = _.get(pa, "payload." + req.body.datapath, "notfound");
                        result.push(clean);
                    }
                    res.json(result);
                });
            }
        });
    }
    ////////////////////////////////
    var limit = 25;
    if (req.body.limit) {
        limit = req.body.limit;
    }
    if (req.body.id) {
        resolved = true;
        db.packets.find({ apikey: req.user.apikey, devid: req.body.id }).sort({ _id: -1 }).limit(limit, function (err, rawpackets) {
            rawpackets = rawpackets.reverse();
            var packets = [];
            for (var p in rawpackets) {
                //packets.push({data: rawpackets[p].payload.data, timestamp: rawpackets[p].payload.timestamp})
                var payload = rawpackets[p].payload;
                payload.meta = { userAgent: rawpackets[p].meta.userAgent, method: rawpackets[p].meta.method };
                packets.push(payload);
            }
            res.json(packets);
        });
    }
    if (resolved == false) {
        res.json({ error: "We require either an id or device key for this query" });
    }
});
app.post("/api/v3/devicePathPackets", function (req, res, next) {
    if (!req.user) {
        res.json({ error: "user not authenticated" });
        return;
    }
    var limit = 25;
    if (req.body.limit) {
        limit = req.body.limit;
    }
    if (req.body.id) {
        db.packets.find({ apikey: req.user.apikey, devid: req.body.id }).sort({ _id: -1 }).limit(limit, function (err, rawpackets) {
            // db.packets.find({ apikey: req.user.apikey, devid: req.body.id }).sort({ _id: -1 }).limit(limit, (err: Error, rawpackets: any) => {
            rawpackets = rawpackets.reverse();
            var packets = [];
            var latlng = {
                ll: [
                    0.01,
                    0.01
                ]
            };
            for (var p in rawpackets) {
                var payload = rawpackets[p];
                var devicepacket;
                var t = {
                    id: payload.payload.id,
                    timestamp: payload.payload.timestamp
                };
                devicepacket = t;
                if (payload.payload.data.gps != undefined || payload.payload.data.gps != null) {
                    devicepacket.data = payload.payload.data;
                }
                else if (payload.meta.ipLoc != undefined || payload.meta.ipLoc != null) {
                    if (payload.meta.ipLoc.ll == undefined || payload.meta.ipLoc == null) {
                        payload.meta.ipLoc = latlng;
                    }
                    devicepacket.ipLoc = payload.meta.ipLoc;
                }
                else {
                    if (payload.meta.ipLoc == undefined || payload.meta.ipLoc == null) {
                        payload.meta.ipLoc = latlng;
                        devicepacket.ipLoc = payload.meta.ipLoc;
                    }
                }
                packets.push(devicepacket);
            }
            res.json(packets);
        });
    }
    else {
        res.json({ error: "No id parameter provided to filter states by id. Use GET /api/v3/states instead for all states data." });
    }
});
// run to update old packet data to have correct timestamp
// app.get("/admin/processpackets", (req:any, res:any)=>{
//   if (req.user.level < 100) { res.end("no permission"); return; }
//   db.packets.find({"_created_on" : { "$exists" : false }}).limit(10000, (err:Error, packets:any)=>{
//     res.write("packets:\t"+packets.length);
//     for (var packet of packets) {
//       if (packet["_created_on"] == undefined) {
//         packet["_created_on"] = new Date(packet.meta.created.jsonTime);
//         db.packets.update({"_id" : packet["_id"]}, packet)
//       }      
//     }
//     res.end("\ndone.")
//   })
// })
// run to update old packet data to have correct timestamp
app.get("/admin/processusers", function (req, res) {
    if (req.user.level < 100) {
        res.end("no permission");
        return;
    }
    db.users.find({ "_created_on": { "$exists": false } }).limit(10000, function (err, users) {
        res.write("users:\t" + users.length);
        for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
            var user = users_1[_i];
            if (user["_created_on"] == undefined) {
                user["_created_on"] = new Date(user.created.jsonTime);
                db.users.update({ "_id": user["_id"] }, user);
            }
        }
        res.end("\ndone.");
    });
});
app.post("/api/v3/account/secure", function (req, res, next) {
    var scryptParameters = scrypt.paramsSync(0.1);
    db.users.find({ encrypted: { $exists: false } }, function (err, result) {
        for (var i in result) {
            var newpass = scrypt.kdfSync(result[i].password, scryptParameters);
            db.users.update({ email: result[i].email }, { $set: { password: newpass, encrypted: true } });
        }
    });
});
app.get("/admin/processusersseen", function (req, res) {
    if (req.user.level < 100) {
        res.end("no permission");
        return;
    }
    db.users.find({ "_last_seen": { "$exists": false } }).limit(10000, function (err, users) {
        res.write("users:\t" + users.length);
        for (var _i = 0, users_2 = users; _i < users_2.length; _i++) {
            var user = users_2[_i];
            if (user["_last_seen"] == undefined) {
                user["_last_seen"] = new Date(user.created.jsonTime);
                db.users.update({ "_id": user["_id"] }, user);
            }
        }
        res.end("\ndone.");
    });
});
app.get("/admin/processstates", function (req, res) {
    if (req.user.level < 100) {
        res.end("no permission");
        return;
    }
    db.states.find({ "_last_seen": { "$exists": false } }).limit(10000, function (err, states) {
        res.write("states:\t" + states.length);
        for (var _i = 0, states_1 = states; _i < states_1.length; _i++) {
            var state = states_1[_i];
            if (state["_last_seen"] == undefined) {
                state["_last_seen"] = new Date(state.meta.created.jsonTime);
            }
            if (state["_created_on"] == undefined) {
                state["_created_on"] = new Date(state.meta.created.jsonTime);
            }
            db.states.update({ "_id": state["_id"] }, state);
        }
        res.end("\ndone.");
    });
});
app.post("/api/v3/view", function (req, res, next) {
    if (!req.user) {
        res.json({ error: "user not authenticated" });
        return;
    }
    if (req.body.username) {
        //
        if (req.body.username != req.user.username) {
            if (req.user.level < 100) {
                db.states.findOne({ devid: req.body.id }, { key: 1 }, function (err, give) {
                    db.users.findOne({ $and: [{ username: req.user.username }, { 'shared.keys.key': give.key }] }, function (err, found) {
                        if (found == null) {
                            res.json({ error: "must be level 100" });
                            return;
                        }
                    });
                });
            }
        }
        db.users.findOne({ username: req.body.username }, function (dbError, user) {
            if (user) {
                ///
                if (req.body.id) {
                    db.states.findOne({ $and: [{ apikey: user.apikey, devid: req.body.id }] }, function (err, state) {
                        if (state == null || state == "" || state == undefined || state.length == 0) {
                            res.json({ "error": "id not found" });
                            return;
                        }
                        if (state) {
                            var viewState = state.payload;
                            viewState.meta = { userAgent: state.meta.userAgent, method: state.meta.method };
                            res.json(viewState);
                        }
                        else {
                            res.json({ error: "state not found" });
                        }
                    });
                }
                else {
                    res.json({ error: "No id parameter provided to filter states by id. Use GET /api/v3/states instead for all states data." });
                }
                ///
            }
        });
        //
    }
    else {
        if (req.body.id) {
            db.states.findOne({ apikey: req.user.apikey, devid: req.body.id }, function (err, state) {
                if (state == null) {
                    res.json({ "error": "id not found" });
                    return;
                }
                if (state) {
                    var viewState = state.payload;
                    viewState.meta = { userAgent: state.meta.userAgent, method: state.meta.method };
                    res.json(viewState);
                }
                else {
                    res.json({ error: "state not found" });
                }
            });
        }
        else {
            res.json({ error: "No id parameter provided to filter states by id. Use GET /api/v3/states instead for all states data." });
        }
    }
});
app.post("/api/v3/state", function (req, res) {
    findstate(req, res);
});
function findstate(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!req.body.username) return [3 /*break*/, 4];
                    if (!(req.body.username != req.user.username)) return [3 /*break*/, 2];
                    if (!(req.user.level < 100)) return [3 /*break*/, 2];
                    return [4 /*yield*/, db.states.findOne({ devid: req.body.id }, function (err, give) {
                            db.users.findOne({ $and: [{ username: req.user.username }, { 'shared.keys.key': give.key }] }, function (err, found) {
                                if (give.public == false || give.public == null || give.public == undefined || !give.public || give.public == "") {
                                    if (found == null) {
                                        res.json({ error: "must be level 100" });
                                        return;
                                    }
                                }
                            });
                        })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [4 /*yield*/, db.users.findOne({ username: req.body.username }, function (dbError, user) {
                        if (user) {
                            if (req.body.id) {
                                db.states.findOne({ $and: [{ apikey: user.apikey, devid: req.body.id }] }, function (err, state) {
                                    res.json(state);
                                });
                            }
                            else {
                                res.json({ error: "No id parameter provided to filter states by id. Use GET /api/v3/states instead for all states data." });
                            }
                        }
                    })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    if (!req.user) {
                        res.json({ error: "user not authenticated" });
                        return [2 /*return*/];
                    }
                    if (req.body.id) {
                        db.states.findOne({ apikey: req.user.apikey, devid: req.body.id }, function (err, state) {
                            res.json(state);
                        });
                    }
                    else {
                        res.json({ error: "No id parameter provided to filter states by id. Use GET /api/v3/states instead for all states data." });
                    }
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
app.post('/api/v3/publicStates', function (req, res) {
    if (req.user.level == 0) {
        db.states.find({ public: true }, function (err, result) {
            res.json(result);
        });
    }
});
app.post('/api/v3/makedevPublic', function (req, res) {
    db.states.update({ key: req.body.devid }, { $set: { public: true } }, function (err, result) {
        res.json(result);
    });
});
app.post('/api/v3/makedevPrivate', function (req, res) {
    db.states.update({ key: req.body.devid }, { $set: { public: false } }, function (err, result) {
        res.json(result);
    });
});
app.get('/api/v3/states', function (req, res) {
    if (!req.user) {
        res.json({ error: "user not authenticated" });
        return;
    }
    db.states.find({ apikey: req.user.apikey }, function (err, states) {
        var cleanStates = [];
        for (var a in states) {
            cleanStates.push(states[a].payload);
        }
        res.json(cleanStates);
    });
});
//Share Device
app.post('/api/v3/shared', function (req, res) {
    if (!req.user) {
        res.json({ error: "user not authenticated" });
        return;
    }
    db.states.findOne({ apikey: req.user.apikey, devid: req.body.dev }, { access: 1, _id: 0 }, function (err, states) {
        if (states.access) {
            res.json(states);
        }
        else {
            res.json({ result: "No Devices" });
        }
    });
});
//Share Device
//unshare Device
app.post('/api/v3/unshare', function (req, res) {
    if (!req.user) {
        res.json({ error: "user not authenticated" });
        return;
    }
    db.states.findOne({ $and: [{ devid: req.body.dev }, { apikey: req.user.apikey }] }, { _id: 0, key: 1 }, function (err, result) {
        db.users.update({ uuid: req.body.removeuser }, { "$pull": { shared: { keys: { key: result.key } } } });
    });
    //remove device from user
    db.states.update({ apikey: req.user.apikey, devid: req.body.dev }, { $pull: { access: { $in: [req.body.removeuser] } } }, function (err, states) {
        res.json(states);
    });
});
//unshare device
//preview devices
app.post('/api/v3/preview/publicdevices', function (req, res) {
    db.states.find({}, { devid: 1 }, function (err, states) {
        res.json(states);
    });
});
//preview devices
// new in 5.0.34:
app.post("/api/v3/states", function (req, res, packet) {
    checkExsisting(req, res);
    if (req.body) {
        // find state by username
        if (req.body.username != req.user.username) {
            if (req.user.level < 100) {
                db.users.findOne({ username: req.body.username }, { apikey: 1, _id: 0 }, function (err, sharedwith) {
                    db.states.find({ $and: [{ apikey: sharedwith.apikey }, { 'access': req.user.uuid }] }, function (err, known) {
                        if (known == null || known.length == 0) {
                            res.json([]);
                            return;
                        }
                    });
                });
            }
            else if (req.user.level) {
                db.users.findOne({ username: req.body.username }, function (e, user) {
                    if (e) {
                        res.json({ error: "db error" });
                    }
                    if (user) {
                        db.states.find({ apikey: user.apikey }, function (er, states) {
                            var cleanStates = [];
                            for (var a in states) {
                                var cleanState = _.clone(states[a]);
                                delete cleanState["apikey"];
                                cleanStates.push(cleanState);
                            }
                            res.json(cleanStates);
                        });
                    }
                });
            }
        }
        // todo filter by permission/level
        if (req.body.username != req.user.username) {
            if (req.user.level < 100) {
                if (req.body.username) {
                    db.users.findOne({ username: req.body.username }, function (e, user) {
                        if (e) {
                            res.json({ error: "db error" });
                        }
                        if (user) {
                            db.states.find({ $or: [{ $and: [{ apikey: user.apikey }, { 'access': req.user.uuid }] }, { public: true }] }, function (er, states) {
                                var cleanStates = [];
                                for (var a in states) {
                                    var cleanState = _.clone(states[a]);
                                    delete cleanState["apikey"];
                                    cleanStates.push(cleanState);
                                }
                                res.json(cleanStates);
                            });
                        }
                    });
                }
            }
        }
        else {
            if (req.body.username) {
                db.users.findOne({ username: req.body.username }, function (e, user) {
                    if (e) {
                        res.json({ error: "db error" });
                    }
                    if (user) {
                        db.states.find({ apikey: user.apikey }, function (er, states) {
                            var cleanStates = [];
                            for (var a in states) {
                                var cleanState = _.clone(states[a]);
                                delete cleanState["apikey"];
                                cleanStates.push(cleanState);
                            }
                            res.json(cleanStates);
                        });
                    }
                });
            }
        }
    }
});
app.get("/api/v3/states/full", function (req, res) {
    db.states.find({ apikey: req.user.apikey }, function (err, states) {
        res.json(states);
    });
});
app.get("/api/v3/states/usernameToDevice", function (req, res) {
    if (req.user.level == 100) {
        db.states.aggregate([{
                $lookup: { from: "users", localField: "meta.user.email", foreignField: "email", as: "fromUsers" }
            },
            { $unwind: '$fromUsers' }, { $match: { apikey: req.user.apikey } },
        ], function (err, result) {
            res.json(result);
        });
    }
    else if (req.user.level == 0) {
        db.states.aggregate([{
                $lookup: { from: "users", localField: "meta.user.email", foreignField: "email", as: "fromUsers" }
            },
            { $unwind: '$fromUsers' }, { $match: { public: true } },
        ], function (err, result) {
            res.json(result);
        });
    }
});
app.post("/api/v3/dashboard", function (req, res) {
    db.states.findOne({ key: req.body.key }, function (e, dev) {
        dev.layout = req.body.layout;
        db.states.update({ key: req.body.key }, dev, function (errorUpdating, resultUpdating) {
            res.json(resultUpdating);
        });
    });
});
app.post("/api/v3/selectedIcon", function (req, res) {
    db.states.findOne({ key: req.body.key }, function (e, dev) {
        dev.selectedIcon = req.body.selectedIcon;
        db.states.update({ key: req.body.key }, dev);
    });
});
app.post("/api/v3/boundaryLayer", function (req, res) {
    db.states.findOne({ key: req.body.key }, function (e, dev) {
        dev.boundaryLayer = req.body.boundaryLayer;
        io.to(req.body.key).emit('boundary', dev);
        var device = dev;
        delete device["_last_seen"];
        delete device["selectedIcon"];
        delete device["layout"];
        device.boundaryLayer["_created_on"] = new Date();
        db.packets.save(dev, function (errSave, resSave) {
            dev["_last_seen"] = new Date();
            dev.payload["timestamp"] = new Date();
            db.states.update({ key: req.body.key }, dev);
            // update user account activity timestamp
            db.users.findOne({ apikey: req.user.apikey }, function (e, user) {
                user["_last_seen"] = new Date();
                db.users.update({ apikey: user.apikey }, user, function (e2, r2) {
                    if (e2) {
                        res.json(e2);
                    }
                    else if (r2) {
                        res.json({ result: "Successfully Added Boundary" });
                    }
                });
            });
        });
    });
});
app.post('/api/v3/accounts/create', function (req, res) {
    if (req.user.level < 100) {
        res.json({ error: "permission denied" });
        return;
    }
    if (req.body) {
        if (req.body.email) {
            accounts.accountCreate(db, req.body.email, req.get('User-Agent'), req.ip, function (err, user) {
                if (err)
                    res.json({ error: err.toString() });
                if (user)
                    res.json(user);
            }, req.body);
        }
    }
});
app.post('/api/v3/account/update', function (req, res) {
    db.users.update({ apikey: req.user.apikey }, { "$set": req.body }, function (err, result) {
        if (err)
            res.json({ error: err.toString() });
        if (result)
            res.json(result);
    });
});
function safeParser(req, res, next) {
    var buf = "";
    req.on("data", function (chunk) { buf += chunk.toString(); });
    req.on("end", function () {
        if (buf.length > 0) {
            try {
                var jsonin = JSON.parse(buf);
                req.body = jsonin;
                next();
            }
            catch (err) {
                res.status(400).json({ "error:": err.toString() + ". Make sure you are sending valid JSON" });
                next();
            }
        }
        else {
            next();
        }
    });
}
function addRawBody(req, res, buf, encoding) {
    req.rawBody = buf.toString();
}
///////// END
app.get("/api/v3/getlocation", function (req, res) {
    //console.log("-------")
    //console.log(req.ip)
    var geoIPLoc = geoip.lookup(req.ip);
    // console.log(geoIPLoc)
    res.json(geoIPLoc);
});
app.put("/api/v3/data/put", function (req, res, next) {
    handleState(req, res, next);
});
app.post("/api/v3/data/post", function (req, res, next) {
    handleState(req, res, next);
});
function checkExsisting(req, res) {
    db.users.findOne({ apikey: req.user.apikey }, function (err, state, info) {
        function findNotified(array) {
            var t = [];
            for (var i = 0; i < array.length; i++) {
                if (array[i].notified == undefined || array[i].notified == null) {
                    array[i].notified = false;
                    io.to(req.user.username).emit("info", info);
                    db.users.update({ apikey: req.user.apikey }, { $set: { notifications: t } }, function (err, updated) {
                        io.to(req.user).emit("notification");
                        if (err)
                            res.json(err);
                        if (updated)
                            res.json(updated);
                    });
                }
                t.push(array[i]);
            }
        }
        function findSeen(array) {
            var t = [];
            for (var i = 0; i < array.length; i++) {
                if (array[i].seen == undefined || array[i].seen == null) {
                    array[i].seen = false;
                    io.to(req.user.username).emit("info", info);
                    db.users.update({ apikey: req.user.apikey }, { $set: { notifications: t } }, function (err, updated) {
                        io.to(req.user).emit("notification");
                        if (err)
                            res.json(err);
                        if (updated)
                            res.json(updated);
                    });
                }
                t.push(array[i]);
            }
        }
        findNotified(state.notifications);
        findSeen(state.notifications);
    });
}
setInterval(function () {
    //getWarningNotification();     //disable till we find out cause of lag
}, 600000);
function getWarningNotification() {
    var now = new Date();
    var dayago = new Date(now - (1000 * 60 * 60 * 24));
    db.states.find({ "_last_seen": { $lte: dayago }, notification24: { $exists: false } }, function (e, listDevices) {
        for (var s in listDevices) {
            var device = listDevices[s];
            db.states.update({ key: device.key }, { $set: { notification24: true } }, function (err, result) {
                var WarningNotificationL = {
                    type: "CONNECTION DOWN 24HR WARNING",
                    device: device.devid,
                    created: new Date(),
                    notified: true,
                    seen: false
                };
                db.users.update({ apikey: device.apikey }, { $push: { notifications: WarningNotificationL } }, function (err, updated) {
                    io.to(device.apikey).emit('pushNotification', WarningNotificationL);
                });
            });
        }
    });
}
function handleState(req, res, next) {
    if (req.body === undefined) {
        return;
    }
    if ((req.user) && (req.user.level) > 0) {
        if (req.body.id == "") {
            res.json({ "error": "id may not be empty" });
        }
        if (!req.body.id) {
            res.json({ "error": "id parameter missing" });
            return;
        }
        if (typeof req.body.id != "string") {
            res.json({ "error": "id must be a string" });
        }
        if (req.body.id.indexOf(" ") != -1) {
            res.json({ "error": "id may not contain spaces" });
        }
        if (req.body.id.match(/^[a-z0-9_]+$/i) == null) {
            res.json({ "error": "id may only contain a-z A-Z 0-9 and _" });
        }
        if (typeof req.body.id != "string") {
            res.status(400).json({ "error": "parameter id must be of type string" });
            return;
        }
        if (!req.body.data) {
            res.status(400).json({ "error": "data parameter missing" });
            return;
        }
        if (req.body.id == null) {
            res.json({ "error": "id parameter null" });
            return;
        }
        if (!req.body.data) {
            res.json({ "error": "data parameter missing" });
            return;
        }
        var meta = {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            method: req.method
        };
        var hrstart = process.hrtime();
        processPacketWorkflow(db, req.user.apikey, req.body.id, req.body, config_2.plugins, function (err, newpacket) {
            state.postState(db, req.user, newpacket, meta, function (packet, info) {
                db.states.findOne({ apikey: req.user.apikey, devid: req.body.id }, function (Err, Result) {
                    var message = "";
                    var AlarmNotification = {
                        type: "ALARM",
                        device: req.body.id,
                        created: Date.now(),
                        message: message,
                        notified: true,
                        seen: false
                    };
                    if (Result.workflowCode != undefined) {
                        if (Result.workflowCode.includes('notifications.alarm1(') && newpacket.err == undefined && newpacket.err == '') {
                            AlarmNotification.message = Result.workflowCode.substring(Result.workflowCode.lastIndexOf('alarm1("') + 8, Result.workflowCode.lastIndexOf('")'));
                            io.to(req.user.apikey).emit('pushNotification', AlarmNotification);
                            io.to(req.user.apikey).emit("notification");
                            if (req.user.notifications) {
                                req.user.notifications.push(AlarmNotification);
                            }
                            else {
                                req.user.notifications = [AlarmNotification];
                            }
                            db.users.findOne({ apikey: req.user.apikey }, function (err, result) {
                                for (var _i = 0, _a = result.notifications; _i < _a.length; _i++) {
                                    var a = _a[_i];
                                    if (a = undefined || a.type !== 'ALARM' && a.device !== req.body.id) {
                                        db.users.update({ apikey: req.user.apikey }, req.user, function (err, updated) {
                                            if (err !== null) {
                                                console.log(err);
                                            }
                                            else if (updated)
                                                console.log(updated);
                                        });
                                    }
                                }
                            });
                        }
                    }
                    else if (Result.boundaryLayer != undefined) {
                        if (Result.boundaryLayer.inbound == false) {
                            AlarmNotification.message = "has gone out of its boundary";
                            io.to(req.user.apikey).emit('pushNotification', AlarmNotification);
                            io.to(req.user.apikey).emit("notification");
                            db.users.findOne({ apikey: req.user.apikey }, function (err, result) {
                                for (var _i = 0, _a = result.notifications; _i < _a.length; _i++) {
                                    var a = _a[_i];
                                    if (a = undefined || a.type !== 'ALARM' && a.device !== req.body.id) {
                                        db.users.update({ apikey: req.user.apikey }, req.user, function (err, updated) {
                                            if (err !== null) {
                                                console.log(err);
                                            }
                                            else if (updated)
                                                console.log(updated);
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
                io.to(req.user.apikey).emit('post', packet.payload);
                io.to(req.user.apikey + "|" + req.body.id).emit('post', packet.payload);
                io.to(packet.key).emit('post', packet.payload);
                db.states.findOne({ apikey: req.user.apikey, devid: req.body.id }, function (findErr, findResult) {
                    if (findResult.notification24 == true) {
                        db.states.update({ key: findResult.key }, { $unset: { notification24: 1 } }, function (err, result) {
                            console.log(result);
                            console.log(err);
                        });
                    }
                });
                if (info.newdevice) {
                    var newDeviceNotification = {
                        type: "NEW DEVICE ADDED",
                        device: req.body.id,
                        created: packet._created_on,
                        notified: true,
                        seen: false
                    };
                    io.to(req.user.username).emit("info", info);
                    io.to(req.user.apikey).emit('pushNotification', newDeviceNotification);
                    if (req.user.notifications) {
                        req.user.notifications.push(newDeviceNotification);
                    }
                    else {
                        req.user.notifications = [newDeviceNotification];
                    }
                    db.users.update({ apikey: req.user.apikey }, req.user, function (err, updated) {
                        io.to(req.user.apikey).emit("notification");
                        if (err)
                            res.json(err);
                        if (updated)
                            res.json(updated);
                    });
                }
                for (var p in config_2.plugins) {
                    if (config_2.plugins[p].handlePacket) {
                        config_2.plugins[p].handlePacket(db, packet, function (err, packet) {
                        });
                    }
                }
                res.json({ result: "success" });
                var hrend = process.hrtime(hrstart);
                utils_1.log(sprintf('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000));
            });
        });
    }
    else {
        res.json({ "error": "user not authenticated" });
    }
}
/* -----------------------------------------------------------------------------
    DB QUERY
*/
function handleDeviceUpdate(apikey, packetIn, options, cb) {
    state.getUserByApikey(db, apikey, function (err, user) {
        if (err) {
            utils_1.log(err);
            cb(err, undefined);
            return;
        }
        processPacketWorkflow(db, apikey, packetIn.id, packetIn, config_2.plugins, function (err, newpacket) {
            state.postState(db, user, newpacket, packetIn.meta, function (packet, info) {
                if (options) {
                    if (options.socketio == true) {
                        io.to(apikey).emit('post', packet.payload);
                        io.to(apikey + "|" + packetIn.id).emit('post', packet.payload);
                        io.to(packet.key).emit('post', packet.payload);
                        if (info.newdevice) {
                            io.to(user.username).emit("info", info);
                        }
                    }
                }
                for (var p in config_2.plugins) {
                    if (config_2.plugins[p].handlePacket) {
                        config_2.plugins[p].handlePacket(db, packet, function (err, packet) {
                        });
                    }
                }
                // iotnxtUpdateDevice(packet, (err:Error, result:any)=>{
                //   if (err) log("couldnt publish")
                // }); 
                cb(undefined, { result: "success" });
            });
        });
    });
}
app.get("/api/v3/state", function (req, res, packet) {
    db.states.find({ "payload.id": req.body.id }, function (err, state) {
        res.json(state);
    });
});
app.get("/api/v3/u/notifications", function (req, res) {
    db.users.findOne({ apikey: req.user.apikey, notifications: req.user.notifications }, function (err, state) {
        res.json(state.notifications);
    });
});
app.post("/api/v3/u/notifications/delete", function (req, res) {
    db.users.update({ apikey: req.user.apikey }, { $unset: { notifications: 1 } }, function (err, state) {
        if (err != null) {
            console.log(err);
        }
        else if (state) {
            console.log(state);
        }
        res.json(state.notifications);
    });
});
app.post("/api/v3/state/delete", function (req, res) {
    if (req.body.username) {
        if (req.body.username != req.user.username) {
            if (req.user.level < 100) {
                res.json({ error: "must be level 100" });
                return;
            }
        }
        db.users.findOne({ username: req.body.username }, function (dbError, user) {
            if (user) {
                var meta = {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    method: req.method
                };
                if (req.user.level < 100 && req.user.level > 0) {
                    if (req.body.id) {
                        db.states.remove({ apikey: user.apikey, devid: req.body.id }, function (err, removed) {
                            if (err)
                                res.json(err);
                            if (removed)
                                res.json(removed);
                        });
                    }
                    else {
                        res.json({ result: "auth failed" });
                    }
                }
                else if (req.user.level >= 100) {
                    if (req.body.id) {
                        db.states.remove({ key: req.body.key, devid: req.body.id }, function (err, removed) {
                            if (err)
                                res.json(err);
                            if (removed)
                                res.json(removed);
                        });
                    }
                    else {
                        res.json({ result: "auth failed" });
                    }
                }
            }
        });
    }
    else {
        if ((req.user) && (req.user.level) > 0) {
            if (!req.body.id) {
                res.json({ "error": "id parameter missing" });
                return;
            }
            var meta = {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                method: req.method
            };
            if (req.user.level < 100 && req.user.level > 0) {
                if (req.body.id) {
                    db.states.remove({ apikey: req.user.apikey, devid: req.body.id }, function (err, removed) {
                        if (err)
                            res.json(err);
                        if (removed)
                            res.json(removed);
                    });
                }
                else {
                    res.json({ result: "auth failed" });
                }
            }
            else if (req.user.level >= 100) {
                if (req.body.id) {
                    db.states.remove({ key: req.body.key, devid: req.body.id }, function (err, removed) {
                        if (err)
                            res.json(err);
                        if (removed)
                            res.json(removed);
                    });
                }
                else {
                    res.json({ result: "auth failed" });
                }
            }
        }
    }
});
app.post("/api/v3/account/recoveraccount", function (req, res) {
    utils_1.log("account registration");
    utils_1.log(req.body);
    req.user.email = req.body.email;
    accounts.Forgotpassword(db, req.user, function (error, result) {
        res.json({ error: error, result: result, account: req.user });
    });
});
app.post("/api/v3/state/clear", function (req, res) {
    if (!req.user) {
        return;
    }
    if (req.user.level < 1) {
        return;
    }
    if (!req.body.id) {
        res.json({ "error": "id parameter missing" });
        return;
    }
    db.states.update({ apikey: req.user.apikey, devid: req.body.id }, { "$set": { payload: { id: req.body.id, data: {} }, "meta.method": "clear", "meta.userAgent": "api" } }, function (err, cleared) {
        if (err)
            res.json(err);
        if (cleared)
            res.json(cleared);
    });
});
app.post("/api/v3/state/deleteBoundary", function (req, res) {
    if (!req.user) {
        return;
    }
    if (req.user.level < 1) {
        return;
    }
    if (!req.body.id) {
        res.json({ "error": "id parameter missing" });
        return;
    }
    db.states.update({ apikey: req.user.apikey, devid: req.body.id }, { $set: { 'boundaryLayer': undefined } }, function (err, cleared) {
        if (err)
            res.json(err);
        if (cleared) {
            db.states.findOne({ apikey: req.user.apikey, devid: req.body.id }, function (e, dev) {
                io.to(dev.key).emit('boundary', dev);
                res.json(cleared);
            });
        }
    });
});
app.post("/api/v3/allUsers", function (req, res) {
    db.users.find({
        $or: [{ 'username': { '$regex': req.body.search } }, { 'email': { '$regex': req.body.search } }],
        level: { $gte: 1 },
        "username": { "$exists": true },
        "$expr": { "$ne": [{ "$strLenCP": "$username" }, 32] } // default random usernames are 32 so we skip these.. usernames shouldnt be this long anyways. I know its kinda a hack.
    }, { username: 1, "_created_on": 1 }, //only return data we need
    function (err, resp) {
        res.json(resp);
    });
});
app.post("/api/v3/state/query", function (req, res) {
    if (!req.user) {
        res.json({ error: "user not authenticated" });
        return;
    }
    if ((req.user) && (req.user.level) > 0) {
        if (!req.body.id) {
            res.json({ "error": "id parameter missing" });
            return;
        }
        var meta = {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            method: req.method
        };
        if (req.body.data) {
            state.queryProject(db, req.user, req.body, meta, function (packet) {
                io.to(req.user.apikey).emit('post', packet.payload);
                io.to(req.user.apikey + "|" + req.body.id).emit('post', packet.payload);
                for (var p in config_2.plugins) {
                    if (config_2.plugins[p].handlePacket) {
                        config_2.plugins[p].handlePacket(db, packet, function (err, packet) {
                        });
                    }
                }
                res.json(packet);
            });
        }
        else {
            state.queryProject(db, req.user, req.body, meta, function (packet) { res.json(packet); });
        }
    }
});
app.get("/api/v3/plugins/definitions", function (req, res) {
    var definitions = [];
    for (var _i = 0, plugins_1 = config_2.plugins; _i < plugins_1.length; _i++) {
        var plugin = plugins_1[_i];
        if (plugin.workflow) {
            utils_1.log("loading workflow definitions for plugin: " + plugin.name);
            definitions.push(plugin.workflowDefinitions);
        }
    }
    res.json({ definitions: definitions });
});
function processPacketWorkflow(db, apikey, deviceId, packet, plugins, cb) {
    db.states.find({ apikey: apikey }, function (err, states) {
        if (err) {
            utils_1.log("WORKFLOW ERROR");
        }
        var statesObj = {};
        for (var s in states) {
            statesObj[states[s].devid] = states[s];
        }
        var state = {};
        for (var s in states) {
            if (states[s].devid == deviceId) {
                state = states[s];
            }
        }
        if (state) {
            if (state.workflowCode) {
                // WORKFLOW EXISTS ON THIS DEVICE
                var sandbox = {
                    http: require("http"),
                    https: require("https"),
                    state: state,
                    states: states,
                    statesObj: statesObj,
                    packet: packet,
                    callback: function (packetDone) {
                        //if (alreadyExitScript == false) { 
                        packetDone.err = "";
                        alreadyExitScript = true;
                        cb(undefined, packetDone);
                        //}
                    }
                };
                for (var _i = 0, plugins_2 = plugins; _i < plugins_2.length; _i++) {
                    var plugin = plugins_2[_i];
                    if (plugin.workflow) {
                        sandbox[plugin.name] = plugin.workflow;
                    }
                }
                var alreadyExitScript = false;
                var vm = new VM({
                    timeout: 1000,
                    sandbox: sandbox
                });
                // Sync
                try {
                    vm.run(state.workflowCode);
                }
                catch (err) {
                    //console.error('Failed to execute script.', err);
                    //if (alreadyExitScript == false) { 
                    utils_1.log("VM WORKFLOW ERROR!");
                    //console.error(err);
                    alreadyExitScript = true;
                    packet.err = err.toString();
                    cb(undefined, packet);
                    //}        
                }
            }
            else {
                // NO WORKFLOW ON THIS DEVICE
                cb(undefined, packet);
            }
        }
        else {
            // NO DEVICE YET
            cb(undefined, packet);
        }
    });
}
exports.processPacketWorkflow = processPacketWorkflow;
var server;
if (config.ssl) {
    server = https.createServer(config.sslOptions, app);
}
else {
    server = http.createServer(app);
}
/* ############################################################################## */
var io = require('socket.io')(server);
io.on('connection', function (socket) {
    setTimeout(function () {
        socket.emit("connect", { hello: "world" });
    }, 5000);
    socket.on('join', function (path) {
        socket.join(path);
    });
    socket.on('post', function (data) {
        for (var key in socket.rooms) {
            if (socket.rooms.hasOwnProperty(key)) {
                var testkey = key;
                if (key.split("|").length == 2) {
                    testkey = key.split("|")[0];
                }
                var packet = {
                    id: data.id,
                    data: data.data,
                    meta: { method: "socketioclient" }
                };
                handleDeviceUpdate(testkey, packet, { socketio: true }, function (e, r) { });
            }
        }
    });
    socket.on('disconnect', function () { });
});
if (config.ssl) {
    server.listen(443);
    // temporary open ports for shockwave pivot
    var httpserver = http.createServer(app);
    httpserver.listen(80);
    // REDIR TO HTTPS
    // var http = require('http');
    // http.createServer(function (req: any, res: any) {
    //   res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    //   res.end();
    // }).listen(80);
    /////
}
else {
    trex.log("HTTP\tServer port: " + config.httpPort);
    server.listen(config.httpPort);
}
server.on('error', function (e) {
    if (e.code == "EACCES") {
        trex.log("\nERROR do you have permission for this port? Try sudo.\n");
    }
    else {
        trex.log(e);
    }
});
process.on('unhandledRejection', utils_1.log);
process.on("uncaughtException", utils_1.log);
