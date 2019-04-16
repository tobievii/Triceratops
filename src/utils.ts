import * as http from "http"
import * as https from "https"
import * as os from 'os';
import * as dns from 'dns';
import * as url from 'url';
import * as _ from 'lodash';

import * as accounts from "./accounts"

import * as logger from "./log"

// Tests to see if we are online.
export function online(): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
        //dns.resolve did not report 'disconnects in a timely manner. Lookup seems to be more efficient
        dns.lookup('google.com', function (err: any) {
            var data: any = {}
            if (err && err.code == "ENOTFOUND") {
                data.INTERNET = false;
                data.STATUS = "OFFLINE";
                reject(data);
            } else {
                data.INTERNET = true;
                data.STATUS = "ONLINE";
                resolve(data)
            }
        });
    })

}

// Finds our ipaddresses
export function ipaddress(cb: any) {
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
                        cb(undefined, interfaces[key][x].address)
                    }
                }
            }
        }
    }



    if (found == 0) {
        cb("notfound", undefined);
    }
}



//gets our public ip address
export function getExternIp(cb: any) {
    //console.log("Getting publicIP..")
    var http = require('http');
    var ip = ""
    http.get('http://bot.whatismyipaddress.com', function (res: any) {
        res.setEncoding('utf8');

        res.on('data', function (chunk: string) {
            ip += chunk;
        });

        res.on('end', function () {
            var sendip = ip;
            cb(undefined, sendip);
        })
    }).on('error', function (err: Error) {
        cb(err, undefined);
    });
}


export function capitalizeFirstLetter(instring: string) {
    instring = instring.toLowerCase();
    return instring.charAt(0).toUpperCase() + instring.slice(1);
}

/* ------------------------------------------------------------------------- */

export function getGUID() {
    var d = new Date().getTime();
    var uuid: string = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

/* ------------------------------------------------------------------------- */


/* ------------------------------------------------------------------------- */

export function log(a: any) { logger.log(a); }

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export function difference(object: any, base: any) {

    function changes(object: any, base: any) {
        return _.transform(object, function (result: any, value: any, key: any) {
            if (!_.isEqual(value, base[key])) {
                result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
            }
        });
    }

    return changes(object, base);
}


export function recursiveFlat(inObj: any) {
    var res: any = {};

    (function recurse(obj, current) {
        for (var key in obj) {
            var value = obj[key];
            var newKey: any = (current ? current + "." + key : key);  // joined key with dot
            if (value && typeof value === "object") {
                recurse(value, newKey);  // it's a nested object, so do it again
            } else {
                res[newKey] = value;  // it's not an object, so set the property
            }
        }
    })(inObj);

    return res;
}



export function restJSON(query: any, cb: any) {

    // apikey:string, method: string, path:string,body:Object,

    const myURL = new url.URL(query.path);

    var protocol = myURL.protocol;

    var protocolObject: any;

    var port;

    if (protocol == "http:") {
        protocolObject = http;
        port = 80;
    } else {
        protocolObject = https;
        port = 443;
    }

    if (query.port) { port = query.port }

    if (myURL.port != "") { port = myURL.port }

    var packet = query.body;
    const postData = JSON.stringify(packet);
    const options: any = {
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
    const req = protocolObject.request(options, (res: any) => {
        // HANDLE RESPONSE:
        // console.log(`STATUS: ${res.statusCode}`);
        // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);        
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => { response += chunk; });
        res.on('end', () => {

            var responseJson = JSON.parse(response);

            if (responseJson) {
                cb(undefined, responseJson);
            }

        });
    });

    req.on('error', (e: Error) => { console.error(`problem with request: ${e.message}`); });
    req.write(postData);
    req.end();



}

//generate random strings
export function generate(count: number) {
    var _sym = 'abcdefghijklmnopqrstuvwxyz1234567890'
    var str = '';
    for (var i = 0; i < count; i++) {
        var tmp = _sym[Math.round(Math.random() * (_sym.length - 1))];
        str += "" + tmp;
    }
    return str;
}


export function generateDifficult(count: number) {
    var _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
    var str = '';
    for (var i = 0; i < count; i++) {
        var tmp = _sym[Math.round(Math.random() * (_sym.length - 1))];
        str += "" + tmp;
    }
    return str;
}

export function createDBIndexes(db: any) {
    // creates optimized indexes
    // meant to be run on first start or when upgrading from an older version
    log("creating db indexes")

    db.states.createIndex({ apikey: 1 })
    db.states.createIndex({ apikey: 1, devid: 1 })
    db.states.createIndex({ "_last_seen": 1 })

    db.packets.createIndex({ "_created_on": 1 })
    db.packets.createIndex({ apikey: 1 })
    db.packets.createIndex({ apikey: 1, devid: 1, "created_on": 1 })

    db.users.createIndex({ uuid: 1 })
    db.users.createIndex({ apikey: 1 })
    db.users.createIndex({ "_last_seen": 1 })
}

export function checkFirstRun(db: any) {
    // checks if this is the first run

    db.users.find({}).count((errUsers: Error, usersCount: number) => {
        if (errUsers) console.log("ERR CANT ACCESS DB.USERS");

        if (usersCount == 0) {
            log("Performing first run tasks");
            accounts.createDefaultAdminAccount(db);
            createDBIndexes(db);
        }
    })

}



export function createUsernamesForOldAccounts(db: any) {
    db.users.find({ "username": { "$exists": false } }).limit(10000, (err: Error, users: any) => {
        for (var user of users) {
            user["username"] = generate(32).toLowerCase()
            db.users.update({ "_id": user["_id"] }, user)
        }
    })
}


export function createDeviceKeysForOldAccounts(db: any) {
    db.states.find({ "key": { "$exists": false } }).limit(10000, (err: Error, states: any) => {
        for (var state of states) {
            state["key"] = generateDifficult(128)
            db.states.update({ "_id": state["_id"] }, state)
        }
    })
}