"use strict";
exports.__esModule = true;
var fs = require("fs");
var utils_1 = require("./utils");
exports.version = {
    "version": "5.0.38",
    "description": "prototype"
};
utils_1.log("VERSION\t" + exports.version.version);
exports.configGen = function () {
    try {
        var mainconfig = JSON.parse(fs.readFileSync('../../../iotconfig.json').toString());
        mainconfig.version = exports.version;
        mainconfig.mongoCollections = ['packets', 'users', 'states'];
        if (mainconfig.ssl == true) {
            mainconfig.sslOptions.cert = fs.readFileSync(mainconfig.sslOptions.certPath);
            mainconfig.sslOptions.key = fs.readFileSync(mainconfig.sslOptions.keyPath);
            if (mainconfig.sslOptions.caPath) {
                mainconfig.sslOptions.ca = fs.readFileSync(mainconfig.sslOptions.caPath);
            }
        }
        return mainconfig;
    }
    catch (err) {
        utils_1.log("CONFIG \tFile not found. Using defaults. See /src/config.ts for details.");
        //DEFAULTS
        var defaultconfig = {
            "ssl": false,
            "httpPort": 8080,
            "mongoConnection": "prototype",
            "iotnxtV3Queue": {
                "gateways": []
            },
            version: exports.version
        };
        return defaultconfig;
    }
};
