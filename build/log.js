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
var events_1 = require("events");
var Logger = /** @class */ (function (_super) {
    __extends(Logger, _super);
    function Logger() {
        return _super.call(this) || this;
    }
    Logger.prototype.connectDb = function (db) {
        this.db = db;
    };
    Logger.prototype.log = function (a) {
        var now = new Date();
        if (typeof a == "object") {
            console.log(now.toISOString() + "\t" + JSON.stringify(a));
        }
        else {
            console.log(now.toISOString() + "\t" + a);
        }
        if (this.db) {
            var logentry = {};
            logentry["_created_on"] = new Date();
            logentry.data = a;
            //this.db.log.save(logentry);
        }
        else {
            console.log(now.toISOString() + "\t" + "LOGGER DB NOT CONNECTED YET");
        }
    };
    return Logger;
}(events_1.EventEmitter));
exports.Logger = Logger;
exports.logger = new Logger();
function log(a) { exports.logger.log(a); }
exports.log = log;
function logDb(db) { exports.logger.connectDb(db); }
exports.logDb = logDb;
