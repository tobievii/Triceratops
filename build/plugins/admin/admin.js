"use strict";
exports.__esModule = true;
var utils_1 = require("../../utils");
var nodemailer = require("nodemailer");
var randomString = require('random-string');
var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;
var io = require('socket.io')(server);
var server;
var accounts = require("../../accounts");
exports.name = "admin";
var scrypt = require("scrypt");
var Cryptr = require('cryptr');
var cryptr = new Cryptr('prototype');
function handlePacket(db, packet, cb) {
}
exports.handlePacket = handlePacket;
function init(app, db, eventHub) {
    app.get("/verify/:id", function (req, res) {
        db.users.findOne({ "_id": ObjectId(req.params.id) }, function (err, user) {
            if (err) {
                utils_1.log(err);
                return;
            }
            if (user == null) {
                res.json({ err: "user not found" });
                return;
            }
            if (user) {
                utils_1.log("found");
                user.emailverified = true;
                db.users.update({ "_id": ObjectId(req.params.id) }, user, function (err, result2) {
                    if (err) {
                        utils_1.log(err);
                        return;
                    }
                    if (result2) {
                        utils_1.log("result2:");
                        utils_1.log(result2);
                        res.redirect("/");
                    }
                });
            }
        });
    });
    //####################################################################
    //Email Verification link
    app.get("/api/v3/admin/requestverificationemail", function (req, res) {
        var verifyLink = req.headers.referer + "verify/" + req.user._id;
        try {
            getRegistration(db, function (err, result) {
                var smtpTransport = nodemailer.createTransport({
                    host: result.nodeMailerTransportHost,
                    port: result.nodeMailerTransportPort,
                    auth: {
                        user: result.nodeMailerTransportAuthUser,
                        pass: result.nodeMailerTransportAuthPass
                    }
                });
                var mail = {
                    from: result.nodeMailerTransportFrom,
                    to: req.user.email,
                    subject: 'Account Verification',
                    text: 'To verify your account please go to ' + verifyLink,
                    html: '<p>To verify your account please go to <a href="' + verifyLink + '">' + verifyLink + '</a></p>'
                };
                smtpTransport.sendMail(mail, function (err, info) {
                    if (err) {
                        utils_1.log(err);
                        return;
                    }
                    if (info) {
                        utils_1.log(info);
                        res.json({ err: {}, result: { mail: "sent" } });
                    }
                });
            });
        }
        catch (err) {
            res.json({ err: err });
        }
        //Email Verification link
        //####################################################################
    });
    //Reset password after link
    app.post("/api/v3/admin/changepassword", function (req, res) {
        var today = new Date();
        today.setHours(today.getHours() + 2);
        var decryptedString = cryptr.decrypt(req.body.pass);
        var scryptParameters = scrypt.paramsSync(0.1);
        var kdfResult = scrypt.kdfSync(decryptedString, scryptParameters);
        db.users.update({ 'recover.recoverToken': req.body.person }, { $set: { "password": kdfResult } }, function (err, response) {
            if (response) {
                if (response.nModified == 0) {
                    res.json(response);
                }
                else {
                    var changeToken = randomString({ length: 128 });
                    db.users.update({ 'recover.recoverToken': req.body.person }, { $set: { recover: { "recoverToken": changeToken, "recoverTime": today } } });
                    res.json(response);
                }
            }
            else if (err) {
                res.json(err);
            }
        });
    });
    app.post("/api/v3/admin/expire", function (req, res) {
        if (req.body.button) {
            var expire = setTimeout(function () {
                var today = new Date();
                today.setHours(today.getHours() + 2);
                var changeTokens = randomString({ length: 128 });
                db.users.update({ 'email': req.body.person }, { $set: { recover: { "recoverToken": changeTokens, "recoverTime": today } } });
            }, 600000);
        }
    });
    //Reset password after link
    //Changing password while logged in
    app.post("/api/v3/admin/userpassword", function (req, res) {
        var decryptedString = cryptr.decrypt(req.body.current);
        var decryptedString2 = cryptr.decrypt(req.body.pass);
        var scryptParameters = scrypt.paramsSync(0.1);
        db.users.findOne({ username: req.body.user }, function (err, found) {
            scrypt.verifyKdf(found.password.buffer, decryptedString, function (err, result) {
                if (result == true) {
                    var newpass = scrypt.kdfSync(decryptedString2, scryptParameters);
                    db.users.update({ $and: [{ username: req.body.user }] }, { $set: { "password": newpass } }, function (err, response) {
                        if (response) {
                            if (response.nModified == 0) {
                                res.json(response);
                            }
                            else {
                                res.json(response);
                            }
                        }
                        else if (err) {
                            res.json(err);
                        }
                    });
                }
                else if (result == false) {
                    res.json(result);
                }
            });
        });
    });
    //Changing password while logged in
    //####################################################################
    //Recover Password Link sent via email
    app.post("/api/v3/admin/recoverEmailLink", function (req, res) {
        var today = new Date();
        today.setHours(today.getHours() + 2);
        var recoverToken = randomString({ length: 128 });
        db.users.update({ email: req.body.email }, { $set: { recover: { "recoverToken": recoverToken, "recoverTime": today } } });
        try {
            getRegistration(db, function (err, result) {
                var verifyLink = req.headers.referer + "recover/" + recoverToken;
                var smtpTransport = nodemailer.createTransport({
                    host: result.nodeMailerTransportHost,
                    port: result.nodeMailerTransportPort,
                    auth: {
                        user: result.nodeMailerTransportAuthUser,
                        pass: result.nodeMailerTransportAuthPass
                    }
                });
                var mail = {
                    from: result.nodeMailerTransportFrom,
                    to: req.body.email,
                    subject: 'Password Recovery',
                    text: 'To reset forgotten Password go to ' + verifyLink,
                    html: '<p>To reset forgotten Password go to <a href="' + verifyLink + '">' + verifyLink + '</a></p>'
                };
                smtpTransport.sendMail(mail, function (err, info) {
                    if (err) {
                        utils_1.log(err);
                        return;
                    }
                    if (info) {
                        res.json({ err: {}, result: { info: info } });
                    }
                });
            });
        }
        catch (err) {
            res.json({ err: err });
        }
    });
    //Recover Password Link sent via email
    //####################################################################
    //####################################################################
    //Shared Device email
    app.post("/api/v3/admin/shareDevice", function (req, res) {
        var today = new Date();
        var shareDeviceNotification = {
            type: "A DEVICE WAS SHARED WITH YOU",
            device: req.body.dev,
            created: today,
            notified: true,
            seen: false
        };
        today.setHours(today.getHours() + 2);
        try {
            getRegistration(db, function (err, result) {
                var smtpTransport = nodemailer.createTransport({
                    host: result.nodeMailerTransportHost,
                    port: result.nodeMailerTransportPort,
                    auth: {
                        user: result.nodeMailerTransportAuthUser,
                        pass: result.nodeMailerTransportAuthPass
                    },
                    pool: true,
                    rateLimit: true,
                    maxConnections: 1,
                    maxMessages: 1 // send 3 emails per second
                });
                var mail = {
                    from: result.nodeMailerTransportFrom,
                    to: req.body.email,
                    subject: req.body.subject,
                    text: req.body.text,
                    html: req.body.html
                };
                smtpTransport.sendMail(mail, function (err, info, packet) {
                    if (err) {
                        utils_1.log(err);
                        return;
                    }
                    if (info) {
                        res.json({ err: {}, result: { mail: "sent" } });
                        db.users.findOne({ email: req.body.email }, { _id: 1 }, function (err, result) {
                            db.users.findOne({ email: req.body.email }, function (err, result) {
                                var t = result.notifications;
                                if (result.notifications) {
                                    t.push(shareDeviceNotification);
                                }
                                else {
                                    t = [shareDeviceNotification];
                                }
                                db.users.update({ email: req.body.email }, { $set: { notifications: t } }, function (err, updated) {
                                    console.log(updated);
                                    io.to(req.body.email).emit("info", info);
                                    if (err)
                                        res.json(err);
                                    if (updated)
                                        res.json(updated);
                                });
                            });
                            db.users.findOne({ email: req.body.email }, { uuid: 1, _id: 0 }, function (err, visitor) {
                                db.states.update({ devid: req.body.dev, apikey: req.user.apikey }, { $push: { access: visitor.uuid } });
                            });
                            db.states.findOne({ devid: req.body.dev }, { key: 1, _id: 0 }, function (err, give) {
                                db.users.update({ email: req.body.email }, { $push: { shared: { $each: [{ keys: give, timeshared: today }] } } }); //adds users _id to keys 
                            });
                        });
                    }
                });
            });
        }
        catch (err) {
            res.json({ err: err });
        }
    });
    //Shared Device email
    //####################################################################
    app.get("/api/v3/admin/registration", function (req, res) {
        // public api to get information if server allows registration/requires email verification
        // if level > 100 then adds the server private email config.
        // if level < 100 then just sends through the public safe data.
        if (req.user.level >= 100) {
            getRegistration(db, function (err, result) {
                res.json({ err: err, result: result });
            });
        }
        else {
            getRegistration(db, function (err, secret) {
                if (secret) {
                    var result = {
                        userEmailVerify: secret.userEmailVerify,
                        userRegistration: secret.userRegistration
                    };
                    res.json({ err: err, result: result });
                }
                else {
                    res.json({});
                }
            });
        }
    });
    app.post("/api/v3/admin/registration", function (req, res) {
        if (req.user.level >= 100) {
            var userinput = req.body;
            userinput.settings = "registration";
            updateRegistration(db, userinput, function (err, result) {
                res.json({ err: err, result: result });
            });
        }
        else {
            utils_1.log("USER NOT AUTHORIZED!" + req.user.email);
            res.json({ err: "not sufficient user level", result: null });
        }
    });
    // handle incoming account registrations (new with optional email verification)
    app.post("/api/v3/admin/register", function (req, res) {
        utils_1.log("ADMIN\tNew Account registration: email: " + req.body.email);
        req.user.email = req.body.email;
        req.user.level = 1;
        var decryptedString = cryptr.decrypt(req.body.pass);
        var scryptParameters = scrypt.paramsSync(0.1);
        //encrypts password
        var kdfResult = scrypt.kdfSync(decryptedString, scryptParameters);
        req.user.password = kdfResult;
        accounts.registerExistingAccount(db, req.user, function (error, result) {
            db.users.update({ email: req.user.email }, { $set: { encrypted: true } });
            res.json({ error: error, result: result, account: req.user });
        });
    });
}
exports.init = init;
function getRegistration(db, cb) {
    db.plugins_admin.findOne({ settings: "registration" }, cb);
}
function updateRegistration(db, userInput, cb) {
    var cleanInput = {
        settings: "registration",
        userRegistration: userInput.userRegistration,
        userEmailVerify: userInput.userEmailVerify,
        nodeMailerTransportHost: userInput.nodeMailerTransportHost,
        nodeMailerTransportPort: userInput.nodeMailerTransportPort,
        nodeMailerTransportAuthUser: userInput.nodeMailerTransportAuthUser,
        nodeMailerTransportAuthPass: userInput.nodeMailerTransportAuthPass,
        nodeMailerTransportFrom: userInput.nodeMailerTransportFrom
    };
    db.plugins_admin.update({ settings: "registration" }, cleanInput, { upsert: true }, cb);
}
