"use strict";
exports.__esModule = true;
var http = require("http");
var https = require("https");
var os = require("os");
var dns = require("dns");
var url = require("url");
var _ = require("lodash");
var accounts = require("./accounts");
var logger = require("./log");
// Tests to see if we are online.
function online() {
    return new Promise(function (resolve, reject) {
        //dns.resolve did not report 'disconnects in a timely manner. Lookup seems to be more efficient
        dns.lookup('google.com', function (err) {
            var data = {};
            if (err && err.code == "ENOTFOUND") {
                data.INTERNET = false;
                data.STATUS = "OFFLINE";
                reject(data);
            }
            else {
                data.INTERNET = true;
                data.STATUS = "ONLINE";
                resolve(data);
            }
        });
    });
}
exports.online = online;
// Finds our ipaddresses
function ipaddress(cb) {
    var interfaces = os.networkInterfaces();
    var found = 0;
    //scans for IPv4 interfaces and filters out localhost.
    for (var key in interfaces) {
        if (interfaces.hasOwnProperty(key)) {
            //console.log(key + " -> " + interfaces[key]);
            for (var x in interfaces[key]) {
                if (interfaces[key][x].family == "IPv4") {
                    //console.log(interfaces[key][x].address)
                    if (interfaces[key][x].address != "127.0.0.1") {
                        found = 1;
                        cb(undefined, interfaces[key][x].address);
                    }
                }
            }
        }
    }
    if (found == 0) {
        cb("notfound", undefined);
    }
}
exports.ipaddress = ipaddress;
//gets our public ip address
function getExternIp(cb) {
    //console.log("Getting publicIP..")
    var http = require('http');
    var ip = "";
    http.get('http://bot.whatismyipaddress.com', function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            ip += chunk;
        });
        res.on('end', function () {
            var sendip = ip;
            cb(undefined, sendip);
        });
    }).on('error', function (err) {
        cb(err, undefined);
    });
}
exports.getExternIp = getExternIp;
function capitalizeFirstLetter(instring) {
    instring = instring.toLowerCase();
    return instring.charAt(0).toUpperCase() + instring.slice(1);
}
exports.capitalizeFirstLetter = capitalizeFirstLetter;
/* ------------------------------------------------------------------------- */
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
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
function log(a) { logger.log(a); }
exports.log = log;
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
function recursiveFlat(inObj) {
    var res = {};
    (function recurse(obj, current) {
        for (var key in obj) {
            var value = obj[key];
            var newKey = (current ? current + "." + key : key); // joined key with dot
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
function restJSON(query, cb) {
    // apikey:string, method: string, path:string,body:Object,
    var myURL = new url.URL(query.path);
    var protocol = myURL.protocol;
    var protocolObject;
    var port;
    if (protocol == "http:") {
        protocolObject = http;
        port = 80;
    }
    else {
        protocolObject = https;
        port = 443;
    }
    if (query.port) {
        port = query.port;
    }
    if (myURL.port != "") {
        port = myURL.port;
    }
    var packet = query.body;
    var postData = JSON.stringify(packet);
    var options = {
        hostname: myURL.hostname,
        port: port,
        path: myURL.pathname,
        method: query.method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    if (query.apikey) {
        options.headers.Authorization = "Basic " + Buffer.from("api:key-" + query.apikey).toString("base64");
    }
    var response = "";
    var req = protocolObject.request(options, function (res) {
        // HANDLE RESPONSE:
        // console.log(`STATUS: ${res.statusCode}`);
        // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);        
        res.setEncoding('utf8');
        res.on('data', function (chunk) { response += chunk; });
        res.on('end', function () {
            var responseJson = JSON.parse(response);
            if (responseJson) {
                cb(undefined, responseJson);
            }
        });
    });
    req.on('error', function (e) { console.error("problem with request: " + e.message); });
    req.write(postData);
    req.end();
}
exports.restJSON = restJSON;
//generate random strings
function generate(count) {
    var _sym = 'abcdefghijklmnopqrstuvwxyz1234567890';
    var str = '';
    for (var i = 0; i < count; i++) {
        var tmp = _sym[Math.round(Math.random() * (_sym.length - 1))];
        str += "" + tmp;
    }
    return str;
}
exports.generate = generate;
function generateDifficult(count) {
    var _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    var str = '';
    for (var i = 0; i < count; i++) {
        var tmp = _sym[Math.round(Math.random() * (_sym.length - 1))];
        str += "" + tmp;
    }
    return str;
}
exports.generateDifficult = generateDifficult;
function createDBIndexes(db) {
    // creates optimized indexes
    // meant to be run on first start or when upgrading from an older version
    log("creating db indexes");
    db.states.createIndex({ apikey: 1 });
    db.states.createIndex({ apikey: 1, devid: 1 });
    db.states.createIndex({ "_last_seen": 1 });
    db.packets.createIndex({ "_created_on": 1 });
    db.packets.createIndex({ apikey: 1 });
    db.packets.createIndex({ apikey: 1, devid: 1, "created_on": 1 });
    db.users.createIndex({ uuid: 1 });
    db.users.createIndex({ apikey: 1 });
    db.users.createIndex({ "_last_seen": 1 });
}
exports.createDBIndexes = createDBIndexes;
function checkFirstRun(db) {
    // checks if this is the first run
    db.users.find({}).count(function (errUsers, usersCount) {
        if (errUsers)
            console.log("ERR CANT ACCESS DB.USERS");
        if (usersCount == 0) {
            log("Performing first run tasks");
            accounts.createDefaultAdminAccount(db);
            createDBIndexes(db);
        }
    });
}
exports.checkFirstRun = checkFirstRun;
function createUsernamesForOldAccounts(db) {
    db.users.find({ "username": { "$exists": false } }).limit(10000, function (err, users) {
        for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
            var user = users_1[_i];
            user["username"] = generate(32).toLowerCase();
            db.users.update({ "_id": user["_id"] }, user);
        }
    });
}
exports.createUsernamesForOldAccounts = createUsernamesForOldAccounts;
function createDeviceKeysForOldAccounts(db) {
    db.states.find({ "key": { "$exists": false } }).limit(10000, function (err, states) {
        for (var _i = 0, states_1 = states; _i < states_1.length; _i++) {
            var state = states_1[_i];
            state["key"] = generateDifficult(128);
            db.states.update({ "_id": state["_id"] }, state);
        }
    });
}
exports.createDeviceKeysForOldAccounts = createDeviceKeysForOldAccounts;
