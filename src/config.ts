import * as fs from 'fs';

import { log } from "./utils"

export var version = {
    "version": "5.0.38",
    "description": "prototype"
}

log("VERSION\t" + version.version)

export var configGen: any = () => {

    try {
        var mainconfig = JSON.parse(fs.readFileSync('../../../iotconfig.json').toString());
        mainconfig.version = version
        mainconfig.mongoCollections = ['packets', 'users', 'states']

        if (mainconfig.ssl == true) {
            mainconfig.sslOptions.cert = fs.readFileSync(mainconfig.sslOptions.certPath)
            mainconfig.sslOptions.key = fs.readFileSync(mainconfig.sslOptions.keyPath)
            if (mainconfig.sslOptions.caPath) {
                mainconfig.sslOptions.ca = fs.readFileSync(mainconfig.sslOptions.caPath)
            }

        }

        return mainconfig
    } catch (err) {
        log("CONFIG \tFile not found. Using defaults. See /src/config.ts for details.")
        //DEFAULTS
        var defaultconfig = {
            "ssl": false,
            "httpPort": 8080,
            "mongoConnection": "prototype",
            "iotnxtV3Queue": {
                "gateways": []
            },
            version: version
        }
        return defaultconfig
    }

}