"use strict";
exports.__esModule = true;
var Discord = require('discord.js');
exports.botsMem = {};
exports.name = "discord";
exports.workflowDefinitions = [
    "var " + exports.name + " = { ",
    "sendmsg: (channelId:string, message:string)",
    "}"
];
exports.workflow = {
    sendmsg: sendmsg
};
function sendmsg(channelId, message) {
    console.log(message);
    exports.bot.channels.get(channelId).send(message);
}
exports.sendmsg = sendmsg;
function init(app, db, eventHub) {
    eventHub.on("device", function (data) { });
    eventHub.on("plugin", function (data) { });
    app.get("/api/v3/discord/bots", function (req, res) {
        db.plugins_discord.find({ apikey: req.user.apikey }, function (err, bots) {
            if (err) {
                res.json(err);
                return;
            }
            res.json(bots);
        });
    });
    app.post("/api/v3/discord/savebot", function (req, res) {
        if (req.user.level < 100) {
            res.json({ err: "permission denied" });
            return;
        }
        var bot = req.body;
        bot.apikey = req.user.apikey;
        savebot(db, bot, function (err, botoptions) {
            if (err) {
                res.json({ err: err.toString() });
            }
            else {
                connectbot(db, botoptions, eventHub, function (err, resp) { });
                res.json(botoptions);
            }
        });
    });
    //connect bots..
    db.plugins_discord.find({}, function (err, bots) {
        for (var b in bots) {
            console.log(bots[b]);
            connectbot(db, bots[b], eventHub, function (err, bot) {
            });
        }
    });
}
exports.init = init;
function savebot(db, botoptions, cb) {
    db.plugins_discord.save(botoptions, cb);
}
exports.savebot = savebot;
function connectbot(db, botOptions, eventHub, cb) {
    exports.bot = new Discord.Client();
    exports.bot.on('ready', function () {
        console.log("Logged in as " + exports.bot.user.tag + "!");
        cb(undefined, exports.bot);
    });
    exports.bot.on('message', function (msg) { if (msg.content === 'ping') {
        msg.reply('pong');
    } });
    exports.bot.login(botOptions.token);
}
exports.connectbot = connectbot;
