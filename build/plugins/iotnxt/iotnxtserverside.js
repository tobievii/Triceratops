"use strict";
exports.__esModule = true;
var iotnxt = require("./iotnxtqueue");
var _ = require("lodash");
var utils_1 = require("../../utils");
exports.name = "iotnxt";
exports.deviceTrees = {};
exports.iotnxtqueues = {};
var config_1 = require("../../config");
var file = "/src/plugins/iotnxt/iotnxtserverside.ts";
var enablePackets = false;
function handlePacket(db, packet, cb) {
    utils_1.log("handle packet");
    if (enablePackets) {
        iotnxtUpdateDevice(db, packet, function (err, result) {
            if (err)
                console.log(err);
            if (result) {
                cb(packet);
            }
        });
    }
    else {
        cb(packet);
    }
}
exports.handlePacket = handlePacket;
function init(app, db, eventHub) {
    // INITIALIZE ROUTES
    app.post("/api/v3/iotnxt/addgateway", function (req, res) {
        addgateway(db, req.body, function (err, result) {
            if (err)
                res.json({ err: err.toString() });
            connectgateway(db, req.body, eventHub, function (errC, resultC) { });
            res.json(result);
        });
    });
    app.post("/api/v3/iotnxt/removegateway", function (req, res) {
        if (req.user.level < 100) {
            res.json({ err: "permission denied" });
            return;
        }
        removegateway(db, req.body, function (err, result) {
            if (err)
                res.json({ err: err.toString() });
            res.json(result);
        });
    });
    app.get("/api/v3/iotnxt/gateways", function (req, res) {
        getgateways(db, function (err, gateways) {
            if (err)
                res.json({ err: err.toString() });
            for (var g in gateways) {
                delete gateways[g].Secret;
            }
            res.json(gateways);
        });
    });
    app.post("/api/v3/iotnxt/setgatewayserverdefault", function (req, res) {
        if (req.user.level < 100) {
            res.json({ err: "permission denied" });
            return;
        }
        setgatewayserverdefault(db, req.body, req.user, function (err, result) {
            if (err)
                res.json({ err: err.toString() });
            res.json(result);
        });
    });
    app.get("/api/v3/iotnxt/cleargatewayaccountdefault", function (req, res) {
        cleargatewayaccountdefault(db, req.user, function (err, result) {
            if (err)
                res.json({ err: err.toString() });
            res.json(result);
        });
    });
    app.post("/api/v3/iotnxt/setgatewayaccountdefault", function (req, res) {
        setgatewayaccountdefault(db, req.body, req.user, function (err, result) {
            if (err)
                res.json({ err: err.toString() });
            res.json(result);
        });
    });
    app.post("/api/v3/iotnxt/setgatewaydevice", function (req, res) {
        var gateway = {
            GatewayId: req.body.GatewayId,
            HostAddress: req.body.HostAddress
        };
        setgatewaydevice(db, req.body.key, req.user.level, req.user.apikey, req.body.id, gateway, function (err, result) {
            res.json(result);
        });
    });
    // getgateways(db, (err: Error, gateways: any) => {
    //   if (gateways) {
    //     for (var g in gateways) {
    //       updategateway(db,gateways[g],{connected:false, error: err},()=>{})
    //     }
    //   }
    // });
    // CONNECT ALL GATEWAYS AT INIT
    utils_1.log("IOTNXT Connecting queues.");
    getgateways(db, function (err, gateways) {
        if (gateways) {
            for (var g in gateways) {
                connectgateway(db, gateways[g], eventHub, function (err, result) { });
            }
        }
    });
    //retry every now and then
    setInterval(function () {
        utils_1.log("IOTNXT auto retry gateways.");
        getgateways(db, function (err, gateways) {
            if (gateways) {
                for (var g in gateways) {
                    if (gateways[g].connected == false) {
                        connectgateway(db, gateways[g], eventHub, function (err, result) { });
                    }
                }
            }
        });
    }, 60 * 1000 * 5); // 5minutes
    // enable packets after 5 seconds.
    setTimeout(function () {
        utils_1.log("IOTNXT Enabling packets.");
        enablePackets = true;
    }, 5000);
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
exports.init = init;
function connectgateway(db, gatewayToconnect, eventHub, cb) {
    utils_1.log("IOTNXT Connecting to " + gatewayToconnect.GatewayId);
    calcDeviceTree(db, gatewayToconnect, function (gateway, deviceTree) {
        //console.log("deviceTree done.")
        exports.deviceTrees[gateway.GatewayId + "|" + gateway.HostAddress] = _.clone(deviceTree);
        connectIotnxt(deviceTree, gateway, function (err, iotnxtqueue) {
            if (err) {
                eventHub.emit("plugin", { plugin: "iotnxt", event: "connect", connected: false, gateway: gateway });
                updategateway(db, gateway, { connected: false, error: err }, function () { });
            }
            if (iotnxtqueue) {
                var identifier = gateway.GatewayId + "|" + gateway.HostAddress;
                exports.iotnxtqueues[identifier] = iotnxtqueue;
                utils_1.log("IOTNXT CONNECTED [" + iotnxtqueue.GatewayId + "]");
                updategateway(db, gateway, { connected: true, error: "" }, function () { });
                eventHub.emit("plugin", {
                    plugin: "iotnxt",
                    event: "connect",
                    connected: true,
                    gateway: gateway
                });
                /////////
                iotnxtqueue.on("disconnect", function () {
                    updategateway(db, gateway, { connected: false }, function () { });
                    eventHub.emit("plugin", {
                        plugin: "iotnxt",
                        event: "disconnect",
                        connected: false,
                        gateway: gateway
                    });
                });
                /////////
                iotnxtqueue.on("request", function (request) {
                    for (var key in request.deviceGroups) {
                        if (request.deviceGroups.hasOwnProperty(key)) {
                            var apikey = key.split(":")[0].split("|")[0];
                            var requestClean = {};
                            requestClean.id = key.split(":")[1].split("|")[0];
                            requestClean.req = request.deviceGroups[key];
                            var meta = { ip: "", userAgent: "iotnxtQueue", method: "REQ" };
                            if (!requestClean.data) {
                                requestClean.data = {};
                            }
                            requestClean.meta = meta;
                            var deviceData = { apikey: apikey, packet: requestClean };
                            eventHub.emit("device", { apikey: apikey, packet: requestClean });
                        }
                    }
                });
            }
        });
    });
}
function addgateway(db, gateway, cb) {
    gateway["default"] = false; // defaults to not the default
    gateway.connected = false;
    gateway.unique = generateDifficult(64);
    gateway.type = "gateway";
    db.plugins_iotnxt.save(gateway, function (err, result) { cb(err, result); });
}
function getgateways(db, cb) {
    db.plugins_iotnxt.find({ type: "gateway" }, function (err, data) {
        if (err) {
            console.error("iotnxt plugin cannot get gateways");
            cb(err, undefined);
        }
        if (data == null) {
            cb(undefined, []);
        }
        else {
            cb(undefined, data);
        }
    });
}
function getserverdefaultgateway(db, cb) {
    db.plugins_iotnxt.findOne({ type: "gateway", "default": true }, function (err, data) {
        if (err) {
            console.error("iotnxt plugin cannot get gateways");
            cb(err, undefined);
        }
        if (data == null) {
            cb(undefined, []);
        }
        else {
            cb(undefined, data);
        }
    });
}
function removegateway(db, data, cb) {
    db.plugins_iotnxt.remove({ type: "gateway", GatewayId: data.GatewayId, HostAddress: data.HostAddress }, cb);
}
function setgatewayserverdefault(db, gateway, user, cb) {
    if (user.level > 50) {
        db.plugins_iotnxt.update({ type: "gateway", "default": true }, { "$set": { "default": false } }, function (err, result) {
            db.plugins_iotnxt.update({ type: "gateway", GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress }, { "$set": { "default": true } }, function (err, resultUpd) {
                if (err) {
                    cb(err, undefined);
                }
                if (resultUpd) {
                    cb(undefined, resultUpd);
                }
            });
        });
    }
    else {
        cb({ err: "permission denied. user level too low" });
    }
}
// clears user default gateway
function cleargatewayaccountdefault(db, user, cb) {
    db.users.update({ apikey: user.apikey }, { "$unset": { "plugins_iotnxt_gatewaydefault": 1 } }, function (err, resultUpd) {
        if (err)
            cb(err, undefined);
        if (resultUpd) {
            cb(undefined, resultUpd);
        }
    });
}
// this updates user default gateway 
function setgatewayaccountdefault(db, gateway, user, cb) {
    db.users.update({ apikey: user.apikey }, {
        "$set": {
            "plugins_iotnxt_gatewaydefault": { GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress }
        }
    }, function (err, resultUpd) {
        if (err)
            cb(err, undefined);
        if (resultUpd) {
            cb(undefined, resultUpd);
        }
    });
}
function setgatewaydevice(db, key, level, apikey, id, gateway, cb) {
    if (level > 0 && level < 100) {
        db.states.update({ $and: [{ devid: id, apikey: apikey }] }, {
            "$set": {
                "plugins_iotnxt_gateway": {
                    GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress
                }
            }
        }, cb);
    }
    else if (level >= 100) {
        db.states.update({ $and: [{ devid: id, key: key }] }, {
            "$set": {
                "plugins_iotnxt_gateway": {
                    GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress
                }
            }
        }, cb);
    }
}
function updategateway(db, gateway, update, cb) {
    db.plugins_iotnxt.update({ type: "gateway", GatewayId: gateway.GatewayId, HostAddress: gateway.HostAddress }, { "$set": update }, function (err, result) {
        if (err) {
            cb(err, undefined);
        }
        if (result) {
            cb(err, result);
        }
    });
}
// Calculates the device object for iotnxt queue registration
function calcDeviceTree(db, gateway, cb) {
    getgateways(db, function (err, gateways) {
        if (gateways) {
            var deviceTree = {};
            var results = 0;
            db.states.find({}, function (err, deviceStates) {
                if (deviceStates.length == 0) {
                    cb(gateway, {});
                }
                else {
                    for (var curdev in deviceStates) {
                        findDeviceGateway(db, deviceStates[curdev].apikey, deviceStates[curdev].devid, function (device, deviceGateway) {
                            results++;
                            if ((deviceGateway) && (gateway)) {
                                if (gateway.GatewayId == deviceGateway.GatewayId) {
                                    var flatdata = recursiveFlat(device.payload.data);
                                    var Properties = {};
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
                        });
                    } //for
                }
            });
        }
    });
}
// callsback with this device's gateway
function findDeviceGateway(db, apikey, devid, cb) {
    db.states.findOne({ apikey: apikey, devid: devid }, function (e, deviceState) {
        if (deviceState == null) {
            cb(new Error("no device"));
            return;
        }
        if (deviceState.plugins_iotnxt_gateway) {
            cb(deviceState, deviceState.plugins_iotnxt_gateway);
        }
        else {
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
    });
}
exports.findDeviceGateway = findDeviceGateway;
function recursiveFlat(inObj) {
    var res = {};
    (function recurse(obj, current) {
        for (var key in obj) {
            var value = obj[key];
            var newKey = current ? current + "." + key : key; // joined key with dot
            if (value && typeof value === "object") {
                recurse(value, newKey); // it's a nested object, so do it again
            }
            else {
                res[newKey] = value; // it's not an object, so set the property
            }
        }
    })(inObj);
    return res;
}
exports.recursiveFlat = recursiveFlat;
function connectIotnxt(deviceTree, gateway, cb) {
    utils_1.log("IOTNXT CONNECTING GATEWAY: [" + gateway.GatewayId + "]");
    if (gateway.HostAddress == undefined) {
        console.error("ERROR gateway.HostAddress undefined");
    }
    var iotnxtqueue = new iotnxt.IotnxtQueue({
        GatewayId: gateway.GatewayId,
        secretkey: gateway.Secret,
        FirmwareVersion: config_1.version.version,
        Make: "IoT.nxt",
        Model: config_1.version.description,
        id: "rouanApi",
        publickey: gateway.PublicKey,
        hostaddress: gateway.HostAddress
    }, deviceTree, true);
    iotnxtqueue.on('error', function (err) {
        console.log(err);
    });
    iotnxtqueue.on("error", function (err) {
        utils_1.log({ err: err, gateway: gateway });
    });
    iotnxtqueue.on("connect", function () { cb(undefined, iotnxtqueue); });
    iotnxtqueue.on("disconnect", function () { });
}
function iotnxtUpdateDevice(db, packet, cb) {
    //console.log(Date.now() + " " + packet.apikey + " " + packet.devid )
    if (packet.apikey == undefined) {
        console.log("---->");
        console.log(packet);
        return;
    }
    findDeviceGateway(db, packet.apikey, packet.devid, function (deviceState, gateway) {
        // console.log("----")
        //  console.log(deviceState);
        //  console.log(gateway);
        if ((deviceState) && (gateway)) {
            calcDeviceTree(db, gateway, function (gateway, deviceTree) {
                var gatewayIdent = gateway.GatewayId + "|" + gateway.HostAddress;
                if (exports.deviceTrees[gatewayIdent]) {
                    //console.log(deviceTrees)
                    var diff = difference(deviceTree, exports.deviceTrees[gatewayIdent]);
                    if (_.isEmpty(diff)) {
                        //console.log("no need to register new endpoints");
                        iotnxtUpdateDevicePublish(gateway, packet, cb);
                    }
                    else {
                        //console.log("need to register new endpoints");
                        if (exports.iotnxtqueues[gatewayIdent]) {
                            exports.iotnxtqueues[gatewayIdent].registerEndpoints(deviceTree, function (err, result) {
                                if (err)
                                    console.log(err);
                                if (result) {
                                    exports.deviceTrees[gatewayIdent] = _.clone(deviceTree);
                                    iotnxtUpdateDevicePublish(gateway, packet, cb);
                                }
                            });
                        }
                        else {
                            console.log("queue not connected");
                        }
                        /////////
                    }
                }
            });
        }
    });
}
function iotnxtUpdateDevicePublish(gateway, packet, cb) {
    var Route = packet.apikey + "|1:" + packet.devid + "|1";
    var flatdata = recursiveFlat(packet.payload.data);
    var gatewayIdent = gateway.GatewayId + "|" + gateway.HostAddress;
    if (exports.iotnxtqueues[gatewayIdent]) {
        exports.iotnxtqueues[gatewayIdent].clearState();
        for (var propertyName in flatdata) {
            if (flatdata.hasOwnProperty(propertyName)) {
                if (typeof flatdata[propertyName] == "object") {
                    exports.iotnxtqueues[gatewayIdent].updateState(Route, propertyName, JSON.stringify(flatdata[propertyName]));
                }
                else {
                    exports.iotnxtqueues[gatewayIdent].updateState(Route, propertyName, flatdata[propertyName]);
                }
            }
        }
        exports.iotnxtqueues[gateway.GatewayId + "|" + gateway.HostAddress].publishState(cb);
    }
    else {
        //console.log("QUEUE UNDEFINED")
    }
}
function generateDifficult(count) {
    var _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    var str = '';
    for (var i = 0; i < count; i++) {
        var tmp = _sym[Math.round(Math.random() * (_sym.length - 1))];
        str += "" + tmp;
    }
    return str;
}
function difference(object, base) {
    if (typeof object !== "object") {
        object = {};
    }
    if (typeof base !== "object") {
        base = {};
    }
    function changes(object, base) {
        return _.transform(object, function (result, value, key) {
            if (!_.isEqual(value, base[key])) {
                result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
            }
        });
    }
    return changes(object, base);
}
exports.difference = difference;
