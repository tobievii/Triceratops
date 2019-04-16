"use strict";
exports.__esModule = true;
exports.plugins = [];
var account = require("./account/account");
var admin = require("./admin/admin");
// import * as serialports from "./serialports/serialports"
var iotnxt = require("./iotnxt/iotnxtserverside");
var tcpPlugin = require("./tcp/pluginTcp_serverside");
var discord = require("./discord/discord");
var mqttPlugin = require("./mqttserver/mqttPlugin");
var httpPlugin = require("./http/pluginHTTP_serverside");
var notifications = require("./notifications/notifications");
exports.plugins.push(account);
exports.plugins.push(admin);
// plugins.push(serialports)
exports.plugins.push(iotnxt);
exports.plugins.push(tcpPlugin);
exports.plugins.push(discord);
exports.plugins.push(mqttPlugin);
exports.plugins.push(httpPlugin);
exports.plugins.push(notifications);
