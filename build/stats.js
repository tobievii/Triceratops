"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var utils_1 = require("./utils");
var dbStats;
function accountStats(user, cb) {
    return __awaiter(this, void 0, void 0, function () {
        // ---------------------------------------------------------
        function accountPacketsTotal() {
            return new Promise(function (resolve) {
                db.packets.find({ apikey: user.apikey }).count(function (err, packetCount) {
                    resolve(packetCount);
                });
            });
        }
        // ---------------------------------------------------------
        function accountPacketsThisMonth() {
            return new Promise(function (resolve) {
                //var time = (24 * 60 * 60 * 1000) * days;
                var now = new Date();
                var startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, now.getTimezoneOffset() / -60);
                db.packets.find({ apikey: user.apikey, "_created_on": { $gt: startOfMonth } }).count(function (err, packetsCount) {
                    var data = {
                        packetsCount: packetsCount,
                        startOfMonth: startOfMonth
                    };
                    resolve(data);
                });
            });
        }
        // ---------------------------------------------------------
        function accountPacketsToday() {
            return new Promise(function (resolve) {
                var time = (24 * 60 * 60 * 1000) * 1;
                db.packets.find({ apikey: user.apikey, "_created_on": { $gt: new Date(Date.now() - time) } }).count(function (err, packetsCount) {
                    resolve(packetsCount);
                });
            });
        }
        // ---------------------------------------------------------
        function accountStatesTotal() {
            return new Promise(function (resolve) {
                db.states.find({ apikey: user.apikey }).count(function (err, statesCount) {
                    resolve(statesCount);
                });
            });
        }
        // ---------------------------------------------------------
        function accountStatesActive24h() {
            return new Promise(function (resolve) {
                var time = (24 * 60 * 60 * 1000) * 1;
                db.states.find({ apikey: user.apikey, "_last_seen": { $gt: new Date(Date.now() - time) } }).count(function (err, statesCount) {
                    resolve(statesCount);
                });
            });
        }
        var db, stats;
        return __generator(this, function (_a) {
            db = dbStats;
            stats = {};
            cb(undefined, stats);
            return [2 /*return*/];
        });
    });
}
exports.accountStats = accountStats;
////// END ACCOUNT STATS
///////////////////////////////// SYSTEM WIDE
function init(app, db) {
    var _this = this;
    utils_1.log("STATS INIT");
    dbStats = db;
    //const person =this.props.username;
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // returns array of days device had activity and counts the amount of packets for each day
    app.post("/api/v3/activity", function (req, res) {
        db.packets.aggregate([
            {
                $match: { _created_on: { $gt: new Date("2019-01-01T00:00:00.000Z") }, apikey: req.user.apikey, devid: req.body.deviceid }
            },
            {
                $group: {
                    _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$_created_on" } } },
                    value: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ], function (err, results) {
            for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
                var result = results_1[_i];
                var temp = {
                    day: result["_id"].date,
                    value: result.value
                };
                delete result.value;
                delete result["_id"];
                result.day = temp.day;
                result.value = temp.value;
            }
            res.json(results);
        });
    });
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // returns general server statistics
    app.get("/api/v3/stats", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var stats, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = {};
                    return [4 /*yield*/, usersNames()];
                case 1:
                    stats = (
                    //   users24h: await usersActiveLastDays(1),
                    //   users24hList: await usersActiveLastDaysNames(1),
                    _a.userList = _b.sent(),
                        _a);
                    res.json(stats);
                    return [2 /*return*/];
            }
        });
    }); });
    //all users
    function usersNames() {
        return new Promise(function (resolve) {
            db.users.find({ level: { $gt: 0 } }, function (err, userList) {
                var nameList = [];
                for (var _i = 0, userList_1 = userList; _i < userList_1.length; _i++) {
                    var user = userList_1[_i];
                    nameList.push({ email: user.email, username: user.username, selected: "deselected", uuid: user.uuid, shared: "no" });
                }
                resolve(nameList);
            });
        });
    }
    //   users last 24hr
    function usersActiveLastDaysNames(days) {
        return new Promise(function (resolve) {
            var time = (24 * 60 * 60 * 1000) * days;
            db.users.find({ level: { $gt: 0 }, "_last_seen": { $gt: new Date(Date.now() - time) } }, function (err, userList) {
                var nameList = [];
                for (var _i = 0, userList_2 = userList; _i < userList_2.length; _i++) {
                    var user = userList_2[_i];
                    nameList.push({ email: user.email, username: user.username, uuid: user.uuid });
                }
                resolve(nameList);
            });
        });
    }
    //   users last 24hr
    function usersActiveLastDays(days) {
        return new Promise(function (resolve) {
            var time = (24 * 60 * 60 * 1000) * days;
            db.users.find({ level: { $gt: 0 }, "_last_seen": { $gt: new Date(Date.now() - time) } }).count(function (err, usersCount) {
                resolve(usersCount);
            });
        });
    }
    //   states last 24hr
    function statesActiveLastDays(days) {
        return new Promise(function (resolve) {
            var time = (24 * 60 * 60 * 1000) * days;
            db.states.find({ "_last_seen": { $gt: new Date(Date.now() - time) } }).count(function (err, statesCount) {
                resolve(statesCount);
            });
        });
    }
    //   packets last 24hr
    function packetsActiveLastDays(days) {
        return new Promise(function (resolve) {
            var time = (24 * 60 * 60 * 1000) * days;
            db.packets.find({ "_created_on": { $gt: new Date(Date.now() - time) } }).count(function (err, packetsCount) {
                resolve(packetsCount);
            });
        });
    }
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
}
exports.init = init;
