"use strict";
exports.__esModule = true;
var net = require("net");
var mqttConnection_1 = require("./mqttConnection");
var _ = require("lodash");
exports.mqttConnections = [];
var utils_1 = require("../../utils");
exports.name = "MQTT";
function handlePacket(db, packet, cb) {
    for (var c in exports.mqttConnections) {
        for (var _i = 0, _a = exports.mqttConnections[c].subscriptions; _i < _a.length; _i++) {
            var sub = _a[_i];
            if ((sub == packet.apikey) || (sub == packet.apikey + "|" + packet.devid)) {
                var temp = _.clone(packet.payload);
                delete temp["meta"];
                delete temp.timestamp;
                if (temp.err != undefined) {
                    if (temp.err == "") {
                        delete temp.err;
                    }
                }
                if (exports.mqttConnections[c].connected) {
                    var sendit = true;
                    // check if this is not the same socket that sent the packet, if so then we do not echo it back.
                    if (_.has(packet, "payload.meta.socketUuid")) {
                        if (packet.payload.meta.socketUuid == exports.mqttConnections[c].uuid) {
                            sendit = false;
                        }
                    }
                    if (sendit) {
                        exports.mqttConnections[c].publish(packet.apikey, JSON.stringify(temp));
                    }
                }
            }
        }
    }
}
exports.handlePacket = handlePacket;
function init(app, db, eventHub) {
    var server = net.createServer(function (socket) {
        var client = new mqttConnection_1.mqttConnection(socket);
        client.on("connect", function (data) {
            exports.mqttConnections.push(client);
            //log("---------=-=-=")
            //log(data)
            // setInterval( ()=>{
            //      client.publish("glp5xm1jpwhtwdnsykv5nv4hhwrp1xy9", JSON.stringify({id:"testDevice",data:{a:Math.random()}}))
            // },2000)
        });
        client.on("subscribe", function (packet) {
            client.subscriptions.push(packet.subscribe);
        });
        client.on("publish", function (publish) {
            //log("mqtt incoming publish"); 
            var requestClean = {};
            try {
                requestClean = JSON.parse(publish.payload);
                requestClean.meta = { "User-Agent": "MQTT", "method": "publish", "socketUuid": client.uuid };
                eventHub.emit("device", { apikey: publish.topic, packet: requestClean });
            }
            catch (err) {
                utils_1.log(err);
            }
        });
        client.on("error", function (err) {
            utils_1.log(err);
        });
        client.on("ping", function () {
            //log("MQTT PING!")
        });
        //client.on("close", (err) => { log("MQTT CLIENT CLOSED") })
    });
    server.listen(1883);
}
exports.init = init;
function mqttUpdateDevice(db, packet, cb) {
    // log("mqtt update device")
    // log(packet)
}
exports.mqttUpdateDevice = mqttUpdateDevice;
