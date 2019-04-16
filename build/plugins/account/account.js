"use strict";
exports.__esModule = true;
var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;
var _ = require("lodash");
exports.name = "account";
var request = require('request');
function handlePacket(db, packet, cb) {
}
exports.handlePacket = handlePacket;
function init(app, db, eventHub) {
    app.post("/api/v3/account/checkupdateusername", function (req, res) {
        checkupdateusername(db, req.body.username, function (result) {
            res.json(result);
        });
    });
    app.post("/api/v3/account/updateusername", function (req, res) {
        checkupdateusername(db, req.body.username, function (result) {
            if (result.available == true) {
                updateusername(db, req.user.uuid, result.username, function () {
                    res.json({});
                });
            }
        });
    });
    app.get("/api/v3/user/:username", function (req, res) {
        getuser(db, req.params.username, function (user) {
            res.json(user);
        });
    });
}
exports.init = init;
function checkupdateusername(db, username, cb) {
    //checks to see if a username has been taken by someone
    db.users.find({ username: username }).count(function (e, result) {
        if (result == 0) {
            // available
            cb({ username: username, available: true });
        }
        else {
            cb({ username: username, available: false });
        }
    });
}
function updateusername(db, uuid, username, cb) {
    db.users.findOne({ uuid: uuid }, function (e, user) {
        user["_last_seen"] = new Date();
        user["username"] = cleaner(username);
        db.users.update({ uuid: uuid }, user, function (e2, r2) {
            cb();
        });
    });
}
function cleaner(str) {
    var strLower = str.toLowerCase();
    return strLower.replace(/\W/g, '');
}
function getuser(db, username, cb) {
    // gets a user by username and sanitizes data for security purposes.
    db.users.findOne({ username: username }, function (e, user) {
        //delete user["_id"]
        var cleandata = _.clone(user);
        delete cleandata["password"];
        delete cleandata["uuid"];
        db.states.find({ apikey: user.apikey }, function (e, states) {
            cleandata.devicecount = states.length;
            githubAccount(user.email, function (result) {
                cleandata.github = result;
                cb(cleandata);
            });
        });
    });
}
function githubAccount(email, cb) {
    var options = {
        url: "https://api.github.com/search/users?q=" + email + "+in%3Aemail",
        headers: { 'User-Agent': 'prototyp3' }
    };
    console.log(options);
    request(options, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
        var result = JSON.parse(body);
        if (result["total_count"] > 0) {
            cb(result.items[0]);
        }
        else {
            cb(undefined);
        }
    });
}
