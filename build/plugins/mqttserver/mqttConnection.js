"use strict";
// ROUAN VAN DER ENDE
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
// http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html#_Toc398718037
// https://docs.solace.com/MQTT-311-Prtl-Conformance-Spec/MQTT%20Control%20Packet%20format.htm#_Toc430864887
var events_1 = require("events");
var accounts = require("../../accounts");
var utils_1 = require("../../utils");
var mqttConnection = /** @class */ (function (_super) {
    __extends(mqttConnection, _super);
    function mqttConnection(socket) {
        var _this = _super.call(this) || this;
        _this.apikey = "";
        _this.subscriptions = [];
        _this.connected = false;
        _this.uuid = "";
        _this.publish = function (topic, data) {
            if (typeof data != "string") {
                data = JSON.stringify(data);
            }
            try {
                _this.socket.write(buildMqttPublishPacket(topic, data));
            }
            catch (err) {
                utils_1.log(err);
            }
            //this.socket.write(Buffer.from("30550020676c7035786d316a7077687477646e73796b76356e76346868777270317879397b226964223a2274657374446576696365222c2264617461223a7b2261223a302e393232373733393235393631383039337d7d", "hex"))
        };
        _this.handleData = function (socket) {
            // http://docs.oasis-open.org/mqtt/mqtt/v3.1.1/errata01/os/mqtt-v3.1.1-errata01-os-complete.html#_Toc442180831
            return function (data) {
                var packetTypeHex = data.slice(0, 1).toString('hex')[0];
                var mqttPacketType = Buffer.from('0' + packetTypeHex, 'hex')[0];
                /*
                    CONNECT
                */
                if (mqttPacketType == 1) {
                    var connect = {
                        lengthMSB: data.readInt8(2),
                        lengthLSB: data.readInt8(3)
                    };
                    connect.protocol = data.slice(4, 4 + connect.lengthLSB).toString();
                    connect.protocolLevel = data.readInt8(8);
                    connect.flagsBinaryStr = data.readUInt8(9).toString(2);
                    connect.flags = {
                        reserved: checkBit(data.slice(9, 10), 0),
                        cleanSession: checkBit(data.slice(9, 10), 1),
                        willFlag: checkBit(data.slice(9, 10), 2),
                        willQosA: checkBit(data.slice(9, 10), 3),
                        willQosB: checkBit(data.slice(9, 10), 4),
                        willRetain: checkBit(data.slice(9, 10), 5),
                        passwordFlag: checkBit(data.slice(9, 10), 6),
                        usernameFlag: checkBit(data.slice(9, 10), 7)
                    };
                    connect.keepAlive = data.readInt16BE(10);
                    var clientidLength = data.readInt16BE(12);
                    connect.clientid = data.slice(14, 14 + clientidLength).toString();
                    var usernameLength = data.readInt16BE(14 + clientidLength);
                    var usernameOffset = 14 + clientidLength + 2;
                    connect.username = data.slice(usernameOffset, usernameOffset + usernameLength).toString();
                    var passwordLength = data.readInt16BE(usernameOffset + usernameLength);
                    var passwordOffset = usernameOffset + usernameLength + 2;
                    connect.password = data.slice(passwordOffset, passwordOffset + passwordLength).toString();
                    //CHECK APIKEY
                    var apikey = connect.password.split("-");
                    if ((apikey[0] == "key") && (apikey.length == 2)) {
                        apikey = apikey[1];
                        accounts.checkApiKey(apikey, function (err, result) {
                            if (err) {
                                utils_1.log("MQTT invalid username/pass");
                                socket.destroy();
                                return;
                            }
                            _this.apikey = apikey;
                            _this.emit("connect", connect);
                            socket.write(" \u0002\u0000\u0000");
                        });
                    }
                    else {
                        utils_1.log("MQTT invalid username/pass");
                        socket.destroy();
                    }
                    //return;
                }
                if (mqttPacketType == 2) {
                    utils_1.log("CONNACK");
                }
                /*-----------------------------------------------------------------------
                          Handle an incoming PUBLISH packet
                      */
                if (mqttPacketType == 3) {
                    var dataToParse = true;
                    var byteOffset = 0;
                    while (dataToParse) {
                        var parse = {};
                        //packet Type
                        var packetTypeHex = data.slice(byteOffset, byteOffset + 1).toString('hex')[0];
                        parse.packetType = Buffer.from('0' + packetTypeHex, 'hex')[0];
                        parse.remainingLength = getRemainingLength(data);
                        parse.retain = !!parseInt(bufferToBinary(data, byteOffset)[7 - 0]);
                        parse.dup = !!parseInt(bufferToBinary(data, byteOffset)[7 - 3]);
                        parse.qos = parseInt(bufferToBinary(data, byteOffset).slice(-3, -1), 2);
                        byteOffset += parse.remainingLength.bytenum - 1;
                        parse.remainingDataTotal = data.length - byteOffset;
                        parse.length = data.readUInt16BE(byteOffset + 2);
                        var topicStartByte = byteOffset + 4;
                        var topicEndByte = topicStartByte + parse.length;
                        parse.topicEndByte = topicEndByte;
                        parse.topic = data.slice(topicStartByte, topicEndByte).toString();
                        // for (var d = byteOffset; d <= (byteOffset + parse.remainingLength) + 1; d++) {
                        //   log(d + "\t" + bufferToBinary(data, d) + "\t" + data.slice(d, d + 1).toString())
                        // }
                        var payloadByte = topicEndByte;
                        if (parse.qos > 0) {
                            payloadByte += 2; /// if QOS 1 or 2 then these two bytes exist for packetIdentifier
                            parse.packetIdentifier = data.readUInt16BE(topicEndByte);
                            parse.packetIdentifierBuffer = data.slice(topicEndByte, topicEndByte + 2);
                        }
                        //PAYLOAD
                        parse.payloadStartByte = payloadByte;
                        parse.payloadEndByte = byteOffset + parse.remainingLength.total + 2;
                        parse.payloadBuffer = data.slice(parse.payloadStartByte, parse.payloadEndByte);
                        parse.payload = parse.payloadBuffer.toString();
                        //log(parse);
                        if (parse.qos == 1) {
                            //var remaininglength = 4;
                            var PUBACK = Buffer.concat([Buffer.from([64]), Buffer.from([2]), parse.packetIdentifierBuffer]); //header
                            socket.write(PUBACK);
                        }
                        if (parse.qos == 2) {
                            var PUBREC = Buffer.concat([Buffer.from([80]), Buffer.from([2]), parse.packetIdentifierBuffer]); //header
                            socket.write(PUBREC);
                        }
                        _this.emit("publish", parse);
                        dataToParse = false;
                    }
                }
                /*-----------------------------------------------------------------------
                    PUBACK
                */
                if (mqttPacketType == 4) {
                    utils_1.log("PUBACK");
                }
                /*-----------------------------------------------------------------------
                    PUBREC
                */
                if (mqttPacketType == 5) {
                    utils_1.log("PUBREC");
                }
                /*-----------------------------------------------------------------------
                   PUBREL used for QOS2
                */
                if (mqttPacketType == 6) {
                    var parse = {};
                    var packetTypeHex = data.slice(0, 0 + 1).toString('hex')[0];
                    parse.packetType = Buffer.from('0' + packetTypeHex, 'hex')[0];
                    parse.packetIdentifier = data.readUInt16BE(2);
                    parse.packetIdentifierBuffer = data.slice(2, 4);
                    var PUBCOMP = Buffer.concat([Buffer.from([112]), Buffer.from([2]), parse.packetIdentifierBuffer]); //header
                    socket.write(PUBCOMP);
                }
                /*-----------------------------------------------------------------------
                   PUBCOMP
                */
                if (mqttPacketType == 7) {
                    utils_1.log("PUBCOMP");
                }
                /*-----------------------------------------------------------------------
                    SUBSCRIBE
                */
                if (mqttPacketType == 8) {
                    var parse = {};
                    parse.packetIdentifier = data.slice(2, 4);
                    parse.remainingLength = getRemainingLength(data);
                    var subTopics = true;
                    parse.subs = [];
                    var topicParseByte = 4;
                    while (subTopics) {
                        var st = {};
                        st.length = data.readUInt16BE(topicParseByte);
                        var topicStartByte = topicParseByte + 2;
                        var topicEndByte = topicStartByte + st.length;
                        st.topic = data.slice(topicStartByte, topicEndByte).toString();
                        st.qos = parseInt(bufferToBinary(data, topicEndByte).slice(-2), 2);
                        parse.subs.push(st);
                        topicParseByte = topicEndByte + 5;
                        if ((data.length - topicEndByte) < 5) {
                            subTopics = false;
                        }
                    }
                    var suback = Buffer.concat([
                        Buffer.from([parseInt("10010000", 2)]),
                        Buffer.from([3]),
                        parse.packetIdentifier,
                        Buffer.from([parse.qos])
                    ]);
                    //log(suback);
                    socket.write(suback);
                    for (var _i = 0, _a = parse.subs; _i < _a.length; _i++) {
                        var sub = _a[_i];
                        _this.emit("subscribe", {
                            subscribe: sub.topic
                        });
                    }
                    return;
                }
                /*-----------------------------------------------------------------------
                    SUBACK
                */
                if (mqttPacketType == 9) {
                    utils_1.log("SUBACK");
                }
                if (mqttPacketType == 10) {
                    utils_1.log("UNSUBSCRIBE");
                }
                if (mqttPacketType == 11) {
                    utils_1.log("UNSUBACK");
                }
                /*-----------------------------------------------------------------------
                    PINGREQ
                */
                if (mqttPacketType == 12) {
                    _this.emit("ping");
                    var ping = Buffer.concat([Buffer.from([208]), Buffer.from([0])]); //header
                    socket.write(ping);
                }
                /*-----------------------------------------------------------------------
                    PINGRESP
                */
                if (mqttPacketType == 13) {
                    utils_1.log("PINGRESP");
                }
                /*-----------------------------------------------------------------------
                    DISCONNECT
                */
                if (mqttPacketType == 14) {
                    utils_1.log("MQTT DISCONNECT");
                }
            };
        };
        _this.uuid = utils_1.generateDifficult(32);
        _this.socket = socket;
        _this.connected = true;
        socket.on("data", _this.handleData(socket));
        socket.on("close", function (err) {
            _this.connected = false;
            _this.emit("close", err);
        });
        return _this;
    }
    return mqttConnection;
}(events_1.EventEmitter));
exports.mqttConnection = mqttConnection;
function parseMqttPublish(data) {
    var parse = {};
    parse.packetType = data.slice(0, 1).toString('hex')[0];
    parse.totalLength = data.length;
    parse.remainingLength = getRemainingLength(data); //data.readUInt8(1)
    var offset = parse.remainingLength.bytenum;
    offset += 2;
    var topicLength = Buffer.from(data.slice(offset, offset + 1).toString('hex'), "hex")[0];
    offset += 1;
    parse.topic = data.slice(offset, offset + topicLength).toString();
    offset += topicLength;
    parse.payload = data.slice(offset).toString();
    return parse;
}
function getRemainingLength(data) {
    var remainingdata = true;
    var total = 0;
    var bytenum = 0;
    if (data[1] <= 127) {
        total += data[1];
        bytenum = 1;
    }
    else {
        bytenum = 2;
        total += data[1] - 128;
        if (data[2] <= 127) {
            total += data[2] * 128;
        }
        else {
            bytenum = 3;
            total += (data[2] - 128) * 128;
            total += data[3] * (128 * 128);
        }
    }
    return { total: total, bytenum: bytenum };
}
function getPacketIdentifier(data) {
    var remainingdata = true;
    var total = 0;
    var bytenum = 0;
    if (data[1] <= 127) {
        total += data[1];
        bytenum = 1;
    }
    else {
        bytenum = 2;
        total += data[1] - 128;
        if (data[2] <= 127) {
            total += data[2] * 128;
        }
        else {
            bytenum = 3;
            total += (data[2] - 128) * 128;
            total += data[3] * (128 * 128);
        }
    }
    return { total: total, bytenum: bytenum };
}
function checkBit(data, bitnum) {
    //bitnum from right
    try {
        var binaryStr = data.readUInt8(0).toString(2);
        return parseInt(binaryStr.slice(binaryStr.length - bitnum - 1, binaryStr.length - bitnum));
    }
    catch (err) {
        return undefined;
    }
}
function buildMqttPublishPacket(topic, data) {
    var totalLength = topic.length + data.length + 2;
    var remainingdataBuffer;
    if (totalLength <= 127) {
        remainingdataBuffer = Buffer.from([totalLength]);
    }
    else {
        if (totalLength <= 16383) {
            remainingdataBuffer = Buffer.from([128 + (totalLength % 128), Math.floor(totalLength / 128)]);
        }
        else {
            remainingdataBuffer = Buffer.from([128 + (totalLength % 128), 128 + (Math.floor((totalLength % (128 * 128)) / 128)), Math.floor(totalLength / (128 * 128))]);
        }
    }
    //log(remainingdataBuffer)
    var pubbuf = Buffer.concat([Buffer.from([48]),
        remainingdataBuffer,
        Buffer.from([
            Math.floor(topic.length / 256),
            topic.length,
        ]),
        Buffer.from(topic),
        Buffer.from(data)
    ]);
    return pubbuf;
}
function bufferToBinary(bufferIn, byteNu) {
    var binarystring = parseInt(bufferIn.slice(byteNu, byteNu + 1).toString("hex"), 16).toString(2);
    while (binarystring.length < 8) {
        binarystring = "0" + binarystring;
    }
    return binarystring;
}
