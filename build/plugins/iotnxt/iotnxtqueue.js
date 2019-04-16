"use strict";
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
var events = require("events");
var mqtt = require("mqtt");
var crypto = require("crypto");
var file = "/src/plugins/iotnxxt/iotnxtqueue.ts";
var utils_1 = require("../../utils");
var mqttcfg = {
    protocol: "mqtts://",
    port: ":8883"
};
/*
var mqttcfg = {
  protocol : "mqtt://",
  port: ":1883"
}
*/
var IotnxtQueue = /** @class */ (function (_super) {
    __extends(IotnxtQueue, _super);
    function IotnxtQueue(config, Devices, force) {
        var _this = _super.call(this) || this;
        _this.connected = false;
        _this.state = { "deviceGroups": {} };
        _this.GatewayId = "";
        _this.secretkey = "";
        _this.secret = {}; //red queue stuff
        _this.hostaddress = "";
        _this.Make = "";
        _this.Model = "";
        _this.FirmwareVersion = "";
        _this.Location = undefined;
        _this.Devices = {};
        _this.GatewayFirstContact = false;
        _this.IsIoTHubDevice = false;
        _this.Config = {};
        _this.ClientId = "";
        _this.modulus = "";
        _this.exponent = "";
        _this.AES = {};
        _this.GatewayId = config.GatewayId;
        _this.hostaddress = config.hostaddress;
        _this.Make = config.Make;
        _this.Model = config.Model;
        _this.FirmwareVersion = config.FirmwareVersion;
        if (config.Location) {
            _this.Location = config.Location;
        }
        _this.secretkey = config.secretkey;
        _this.modulus = config.publickey.split("<").join(',').split(">").join(',').split(',')[8];
        _this.exponent = config.publickey.split("<").join(',').split(">").join(',').split(',')[4];
        _this.Devices = Devices;
        genAESkeys(function (AES) {
            _this.AES = AES;
            _this.connectGreenQ(function (err, secret) {
                if (err) {
                    //this.emit('error', err);
                    utils_1.log(err);
                }
                if (secret) {
                    _this.connectRedQ(function (err, result) {
                        if (err)
                            console.log(err);
                        if (result) {
                            _this.register(function (err, result) {
                                //console.log("subscribe to routingkeybase")
                                //console.log(this.secret.RoutingKeyBase);
                                _this.mqttRed.subscribe(_this.secret.RoutingKeyBase + ".REQ", function (err) {
                                    if (err)
                                        console.log(err);
                                });
                                _this.mqttRed.on('message', function (topic, message) {
                                    //console.log("!!!!!!!!!!")
                                    var json = JSON.parse(message.toString());
                                    var payload = JSON.parse(Buffer.from(json.Payload, "base64").toString());
                                    _this.emit('request', payload);
                                });
                                _this.emit('connect');
                            });
                        }
                    });
                }
            });
        });
        return _this;
    }
    /* ################################################################################## */
    IotnxtQueue.prototype.connectGreenQ = function (cb) {
        var _this = this;
        var greenOptions = {
            clientId: this.GatewayId + ".GREEN." + ((Date.now() * 10000) + 621355968000000000),
            username: "green1:public1",
            password: "publicpassword1"
        };
        var replyKey = "MessageAuthNotify.".toUpperCase() + getGUID().toUpperCase();
        var mqttGreen = mqtt.connect(mqttcfg.protocol + this.hostaddress + mqttcfg.port, greenOptions);
        mqttGreen.on('error', function (err) { cb(err, undefined); });
        mqttGreen.on("offline", function (err) { cb(err, undefined); });
        mqttGreen.on("close", function (err) { cb(err, undefined); });
        mqttGreen.on('connect', function () {
            mqttGreen.subscribe(replyKey, { qos: 0 }, function (err, granted) {
                if (granted) {
                    ///
                    var messageAuthRequest = {
                        Uid: _this.GatewayId,
                        SecretKey: _this.secretkey,
                        PostUtc: new Date().toISOString(),
                        Headers: {}
                    };
                    var cipher = createCipheriv(_this.AES);
                    var textBuffer = Buffer.from(JSON.stringify(messageAuthRequest));
                    var encrypted = cipher.update(textBuffer);
                    var encryptedFinal = cipher.final();
                    var newBuffer = Buffer.concat([encrypted, encryptedFinal]);
                    var RSAcreds = {
                        modulus: _this.modulus,
                        exponent: _this.exponent
                    };
                    var wrappedMessage = {
                        Payload: newBuffer.toString("base64"),
                        IsEncrypted: true,
                        Headers: {
                            //SymKey: publicKeyRSA.encrypt(AES.key, "UTF8", "base64", ursa.RSA_PKCS1_PADDING).toString("base64"),
                            SymIv: RSAENCRYPT(_this.AES.iv, RSAcreds),
                            SymKey: RSAENCRYPT(_this.AES.key, RSAcreds)
                        },
                        PostUtc: new Date().toISOString(),
                        ReplyKey: replyKey.toUpperCase()
                    };
                    //console.log(wrappedMessage)
                    mqttGreen.publish("MESSAGEAUTHREQUEST", JSON.stringify(wrappedMessage), { qos: 1 }, function (err) {
                        if (err) {
                            console.error("publisherror:" + err);
                        }
                    });
                    ///
                }
            });
        });
        mqttGreen.on('message', function (topic, message, packet) {
            var json = JSON.parse(message.toString());
            var payload = Buffer.from(json.Payload, "base64");
            var decipher = createDecipheriv(_this.AES);
            var result = Buffer.concat([decipher.update(payload), decipher.final()]);
            var secret = JSON.parse(result.toString());
            mqttGreen.end(undefined, function () {
                if (secret.Success == true) {
                    //console.log(secret);
                    _this.secret = secret;
                    cb(undefined, secret);
                }
                else {
                    utils_1.log("IOTNXT FAILED TO CONNECT [" + _this.GatewayId + "] ErrorMsg:" + secret.ErrorMsg);
                    if (secret.ErrorMsg) {
                        cb(secret.ErrorMsg.split('\n')[0], undefined);
                    }
                    else {
                        cb("invalid server response", undefined);
                    }
                }
            });
        });
    };
    /* ################################################################################## */
    IotnxtQueue.prototype.connectRedQ = function (cb) {
        var _this = this;
        var redoptions = {
            clientId: this.secret.ClientId + ".RED." + ((Date.now() * 10000) + 621355968000000000),
            username: this.secret.vHost + ":" + this.GatewayId,
            password: this.secret.Password
        };
        this.mqttRed = mqtt.connect(mqttcfg.protocol + this.secret.Hosts[0] + mqttcfg.port, redoptions);
        this.mqttRed.on('connect', function () {
            _this.connected = true;
            cb(undefined, true);
        });
        this.mqttRed.on('reconnect', function () { console.log("Queue reconnected"); });
        this.mqttRed.on('close', function () { console.log("Queue disconnected"); });
        this.mqttRed.on('offline', function () { console.log("Queue has gone offline"); });
        this.mqttRed.on('error', function (error) {
            console.log("error: " + error);
        });
    };
    /* ################################################################################## */
    IotnxtQueue.prototype.register = function (cb) {
        var packet = {
            "messageType": "Gateway.RegisterGatewayFromGateway.1",
            "args": {
                "gateway": {
                    "GatewayId": this.GatewayId,
                    "Make": this.Make,
                    "Model": this.Model,
                    //"FirmwareVersion": "1.0.1",//this.FirmwareVersion,
                    "FirmwareVersion": this.FirmwareVersion,
                    "Location": this.Location,
                    "Secret": this.secretkey,
                    "Devices": this.Devices,
                    "GatewayFirstContact": false,
                    "IsIoTHubDevice": false,
                    "ClientId": this.ClientId
                }
            },
            "expiresAt": new Date(new Date().getTime() + 15 * 1000).toISOString()
        };
        // console.log("=============================== !!!!")
        //console.log(JSON.stringify(packet, null, 2));
        var textBuffer = Buffer.from(JSON.stringify(packet));
        var wrappedMessage = {
            Payload: textBuffer.toString("base64"),
            IsEncrypted: false,
            Headers: {},
            PostUtc: new Date().toISOString(),
            ReplyKey: "DAPI.1.DAPI.REPLY.1." + this.secret.ClientId.toUpperCase() + "." + getGUID().toUpperCase() + "." + getGUID().toUpperCase()
        };
        var subtopic = wrappedMessage.ReplyKey.toUpperCase(); //.split(".").join("/").toUpperCase();
        var topic = "DAPI.1.Gateway.RegisterGatewayFromGateway.1." + this.secret.ClientId + ".DEFAULT";
        this.mqttRed.publish(topic.toUpperCase(), JSON.stringify(wrappedMessage), function (err) {
            if (err) {
                console.log("ERROR:");
                console.log(err);
            }
            else {
                cb(undefined, true); //SUCCESS
            }
        });
    };
    /* ################################################################################## */
    IotnxtQueue.prototype.clearState = function () {
        this.state = {};
    };
    IotnxtQueue.prototype.updateState = function (route, property, data) {
        //iotnxt.updateState(this.state, route, property, data );
        if (!this.state.deviceGroups) {
            this.state.deviceGroups = {};
        }
        if (!this.state.deviceGroups[route]) {
            this.state.deviceGroups[route] = {};
        }
        var before = this.state.deviceGroups[route][property];
        this.state.deviceGroups[route][property] = data;
        if (before != data) {
            return { updated: 1 };
        }
        else {
            return { updated: 0 };
        }
    };
    /* ################################################################################## */
    IotnxtQueue.prototype.publishState = function (cb) {
        var packet = JSON.parse(JSON.stringify(this.state));
        ///////
        packet.CommandText = "DigiTwin.Notification";
        packet.Headers = {
            "FileName": "",
            "Version": "2.15.0",
            "Raptor": "000000000000"
        };
        var dateNow = new Date();
        var fromUtc = new Date(dateNow.getTime() - 15 * 1000);
        packet.MessageId = getGUID();
        packet.PostUtc = dateNow.toISOString();
        packet.MessageSourceId = null;
        packet.fromUtc = fromUtc.toISOString();
        packet.sourceMessageID = getGUID();
        //console.log(packet);
        var textBuffer = Buffer.from(JSON.stringify(packet));
        var wrappedMessage = {
            Payload: textBuffer.toString("base64"),
            IsEncrypted: false,
            Headers: {},
            PostUtc: new Date().toISOString()
        };
        //Persist state before sending
        //PersistenceService.insert(packet)
        try {
            var routingkey = this.secret.RoutingKeyBase + ".NFY";
            //console.log(routingkey)
            this.mqttRed.publish(routingkey, JSON.stringify(wrappedMessage), { qos: 0 }, function (err) {
                if (err) {
                    console.log("ERROR:" + err);
                    cb(err, undefined);
                }
                else {
                    cb(undefined, true);
                }
            });
        }
        catch (err) {
            console.error("Failed to publish packet - \n Error : [" + err + "] \n [" + JSON.stringify(wrappedMessage) + "]");
        }
    };
    /* ################################################################################## */
    IotnxtQueue.prototype.registerEndpoints = function (deviceTree, cb) {
        console.log(this.GatewayId + " REGISTERING");
        this.Devices = deviceTree;
        this.register(cb);
        //iotnxt.reRegister(deviceTree, cb)
    };
    return IotnxtQueue;
}(events.EventEmitter));
exports.IotnxtQueue = IotnxtQueue;
function RSAENCRYPT(text, credentials) {
    // https://stackoverflow.com/questions/27568570/how-to-convert-raw-modulus-exponent-to-rsa-public-key-pem-format
    var publicKey = RSAgenPEM(credentials.modulus, credentials.exponent);
    var buffer = Buffer.from(text);
    var rsakey = {
        key: publicKey,
        padding: 1 //crypto.constants.RSA_PKCS1_PADDING  
    };
    //An optional padding value defined in crypto.constants, which may be: crypto.constants.RSA_NO_PADDING, RSA_PKCS1_PADDING, or crypto.constants.RSA_PKCS1_OAEP_PADDING.
    var encrypted = crypto.publicEncrypt(rsakey, buffer);
    return encrypted.toString("base64");
}
exports.RSAENCRYPT = RSAENCRYPT;
function RSAgenPEM(modulus, exponent) {
    // by Rouan van der Ende
    // converts a raw modulus/exponent public key to a PEM format.
    var header = Buffer.from("MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA", 'base64'); //Standard header
    var mod = Buffer.from(modulus, 'base64');
    var midHeader = Buffer.from([0x02, 0x03]);
    var exp = Buffer.from(exponent, 'base64');
    //combine
    var key = Buffer.concat([header, mod, midHeader, exp]);
    var keybase64 = key.toString("base64");
    var PEM = "-----BEGIN PUBLIC KEY-----\r\n";
    for (var a = 0; a <= Math.floor(keybase64.length / 64); a++) {
        PEM += keybase64.slice(0 + (64 * a), 64 + (64 * a)) + "\r\n";
    }
    PEM += "-----END PUBLIC KEY-----\r\n";
    return PEM;
}
exports.RSAgenPEM = RSAgenPEM;
function genAESkeys(callback) {
    crypto.pseudoRandomBytes(32, function (err, keyBuffer) {
        crypto.pseudoRandomBytes(16, function (err, ivBuffer) {
            callback({ key: keyBuffer, iv: ivBuffer });
        });
    });
}
exports.genAESkeys = genAESkeys;
function createCipheriv(AES, algorithm) {
    if (algorithm === void 0) { algorithm = "aes-256-cbc"; }
    return crypto.createCipheriv(algorithm, AES.key, AES.iv);
}
exports.createCipheriv = createCipheriv;
function createDecipheriv(AES, algorithm) {
    if (algorithm === void 0) { algorithm = "aes-256-cbc"; }
    return crypto.createDecipheriv(algorithm, AES.key, AES.iv);
}
exports.createDecipheriv = createDecipheriv;
function getGUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
exports.getGUID = getGUID;
;
