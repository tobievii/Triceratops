"use strict";
exports.__esModule = true;
var geoip = require("geoip-lite"); // https://www.npmjs.com/package/geoip-lite
var utils_1 = require("./utils");
var _ = require("lodash");
var scrypt = require("scrypt");
var dbglobal;
var Cryptr = require('cryptr');
var cryptr = new Cryptr('prototype');
function midware(db) {
    dbglobal = db;
    return function (req, res, next) {
        if (req.headers.authorization) {
            var auth = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
            if (auth.split(":")[0] == "api") {
                var apiAuth = auth.split(":")[1];
                var apikey = apiAuth.split("-")[1];
                db.users.findOne({ apikey: apikey }, function (err, user) {
                    if (user) {
                        req.user = user;
                        next();
                    }
                    else {
                        next();
                    }
                });
            }
            else {
                res.json({ error: "Authorization header invalid" });
                return;
            }
        }
        else {
            if (req.cookies) {
                if (!req.cookies.uuid) {
                    accountCreate(db, "", req.get('User-Agent'), req.ip, function (err, user) {
                        if (err) {
                            next();
                        }
                        else {
                            cookieSetFromUser(user, req, res, next);
                        }
                    }, undefined);
                }
                else {
                    db.users.findOne({ uuid: req.cookies.uuid }, function (err, user) {
                        if (user) {
                            user._last_seen = new Date();
                            //db.users.update({"_id":user["_id"]}, user);
                            req.user = user;
                            next();
                        }
                        else {
                            console.log("ERROR USER NOT FOUND IN DB");
                            res.clearCookie('uuid');
                            accountCreate(db, "", req.get('User-Agent'), req.ip, function (err, user) {
                                if (err) {
                                    next();
                                }
                                else {
                                    cookieSetFromUser(user, req, res, next);
                                }
                            }, undefined);
                        }
                    });
                }
            }
            else {
                console.log("ERROR NO COOKIE MIDDLEWARE?");
            }
        }
        ////
    };
}
exports.midware = midware;
function cookieSetFromUser(user, req, res, next) {
    var expiryDate = new Date(Number(new Date()) + 315360000000); //10 years
    res.cookie('uuid', user.uuid, { expires: expiryDate, httpOnly: true });
    req.user = user;
    next();
}
exports.cookieSetFromUser = cookieSetFromUser;
function signInFromWeb(db) {
    return function (req, res, next) {
        if (req.body) {
            if (req.body.email) {
                if (validateEmail(req.body.email) && req.body.pass) {
                    var decryptedString_1 = cryptr.decrypt(req.body.pass);
                    db.users.findOne({ email: req.body.email }, function (err, user) {
                        if (user == null) {
                            res.json({ error: "Account not registered" });
                        }
                        scrypt.verifyKdf(user.password.buffer, decryptedString_1, function (err, result) {
                            if (result == true) {
                                req.user = user;
                                cookieSetFromUser(user, req, res, function () {
                                    res.json({ signedin: true });
                                });
                            }
                            else {
                                res.json({ error: "wrong email and/or password" });
                            }
                        });
                    });
                }
                else {
                    res.json({ error: "not valid email and/or password" });
                }
            }
            else {
                res.json({ error: "email address can not be empty" });
            }
        }
        else {
            res.json({ error: "could not parse json" });
        }
    };
}
exports.signInFromWeb = signInFromWeb;
function accountVerify(db) {
    return function (req, res) {
        if (req.body.email) {
            db.users.findOne({ uuid: req.user.uuid }, function (errFind, user) {
                if (user) {
                    if (user.email) {
                        user.emailold = user.email;
                    } //save old
                    user.email = req.body.email;
                    user.emailverified = false;
                    user.secretemailverificationcode = utils_1.generate(128);
                    db.users.update({ uuid: user.uuid }, user, function (errUpd, resUpd) {
                        var gotourl = '/verify/' + user.uuid + '/' + user.secretemailverificationcode;
                        /*
                        sendmail(user.email, "plz verify. " + gotourl, (err: Error, mailed: any) => {
                          res.json(mailed)
                        })
                        */
                    });
                }
                else {
                    console.log("USER NOT FOUND IN DB.");
                    res.json({ result: "USER NOT FOUND" });
                }
            });
        }
    };
}
exports.accountVerify = accountVerify;
function accountVerifyCheck(db) {
    return function (req, res) {
        console.log("accountVerifyCheck");
        db.users.findOne({ uuid: req.params.uuid, 'secretemailverificationcode': req.params.emailverificationcode }, function (err, user) {
            if (err)
                console.log(err);
            if (user) {
                user.emailverified = true;
                db.users.update({ uuid: req.params.uuid }, user, function (errUpd, resultUpd) {
                    res.json(resultUpd);
                });
            }
            else {
                res.end("ERROR wrong user/secret");
            }
        });
    };
}
exports.accountVerifyCheck = accountVerifyCheck;
function defaultAdminAccount(db) {
    // check if this is the first account.
    db.users.find({}).count(function (errUsers, usersCount) {
        if (errUsers)
            console.log("ERR CANT ACCESS DB.USERS");
        if (usersCount == 0) {
            console.log("==== ADMIN ACCCOUNT ===");
            console.log(usersCount);
            createDefaultAdminAccount(db);
        }
    });
    //
}
exports.defaultAdminAccount = defaultAdminAccount;
function createDefaultAdminAccount(db) {
    utils_1.log("creating default admin account");
    var scryptParameters = scrypt.paramsSync(0.1);
    var kdfResult = scrypt.kdfSync("admin", scryptParameters);
    accountCreate(db, "admin@localhost.com", "defaultAdmin", "", function (err, user) {
    }, { password: kdfResult, level: 99, encrypted: true });
}
exports.createDefaultAdminAccount = createDefaultAdminAccount;
function registerExistingAccount(db, user, cb) {
    if (validateEmail(user.email)) {
        db.users.find({ email: user.email }, function (err, usersEmailExists) {
            if (usersEmailExists.length == 0) {
                db.users.update({ uuid: user.uuid }, user, { upsert: true }, cb);
                //cb("Registration Succcesful", undefined)
            }
            else {
                cb("that email is taken", undefined);
            }
        });
    }
    else {
        cb("not valid email", undefined);
    }
}
exports.registerExistingAccount = registerExistingAccount;
function Forgotpassword(db, user, cb) {
    console.log("forgotpassword backend");
    if (user.email.length != 0) {
        if (validateEmail(user.email)) {
            db.users.find({ email: user.email }, function (err, result) {
                if (result.length == 0) {
                    cb("Email does not exist");
                }
                else {
                    db.users.update({ email: user.email }, { $set: { recover: { "recoverToken": null, "recoverTime": "" } } });
                    cb(null, result);
                }
            });
        }
        else {
            cb("not valid email", undefined);
        }
    }
    else {
        cb("email can not be empty", undefined);
    }
}
exports.Forgotpassword = Forgotpassword;
// V3 API: ACCOUNT CREATE
function accountCreate(db, email, userAgent, ip, cb, accRequest) {
    var event = new Date();
    var geoIPLoc = geoip.lookup(ip);
    var user = {
        uuid: utils_1.generate(128),
        "_created_on": new Date(),
        created: {
            unix: event.getTime(),
            jsonTime: event.toJSON()
        },
        lastSeen: {
            unix: event.getTime(),
            jsonTime: event.toJSON()
        },
        ip: ip,
        ipLoc: geoIPLoc,
        userAgent: userAgent,
        username: utils_1.generate(32).toLowerCase(),
        emailverified: false,
        email: email.toLowerCase(),
        apikey: utils_1.generate(32),
        password: utils_1.generateDifficult(16),
        level: 0
    };
    if (accRequest) {
        // not ideal, used for automated testing
        if (accRequest.password) {
            user.password = accRequest.password;
        }
        if (accRequest.level) {
            user.level = accRequest.level;
        }
    }
    if (user.email.length > 0) {
        if (validateEmail(user.email)) {
            console.log("valid email");
            user.level++;
            db.users.find({ email: user.email }, function (err, userExists) {
                if (err)
                    cb(err, undefined);
                if (userExists.length > 0) {
                    cb({ error: "email exists" }, undefined);
                    console.log("USER ALREADY EXISTS");
                }
                else {
                    console.log("USER email does not exist in db yet.");
                    db.users.save(user, cb);
                }
            });
        }
        else {
            console.log("not valid email");
        }
    }
    else {
        // auto created from cookies (no email data);
        db.users.save(user, cb);
        // todo - add a dummy device
    }
}
exports.accountCreate = accountCreate;
function accountClear(db, account, cb) {
    if (account) {
        db.users.remove(account, cb);
    }
}
exports.accountClear = accountClear;
function accountDelete(db, user, cb) {
    //console.log("USER!")
    //console.log(user);
    db.users.remove(user, function (err, result) {
        if (err) {
            cb(err, undefined);
        }
        if (result) {
            cb(undefined, result);
        }
    });
}
exports.accountDelete = accountDelete;
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
exports.validateEmail = validateEmail;
/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
function difference(object, base) {
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
function validApiKey(db, testkey, cb) {
    db.users.findOne({ apikey: testkey }, function (err, user) {
        if (user) {
            cb(undefined, { testkey: testkey, valid: true, user: user });
        }
        else {
            cb({ testkey: testkey, valid: false }, undefined);
        }
    });
}
exports.validApiKey = validApiKey;
function checkApiKey(testkey, cb) {
    validApiKey(dbglobal, testkey, cb);
}
exports.checkApiKey = checkApiKey;
