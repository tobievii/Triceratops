"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var events_1 = require("events");
var fs = require("fs");
var request = require("request");
// This script lets you update ESP32 from nodejs.
var ESPUpdater = /** @class */ (function (_super) {
    __extends(ESPUpdater, _super);
    function ESPUpdater(device, filename) {
        var _this = _super.call(this) || this;
        _this.updateSize = 0;
        _this.filename = "";
        _this.percentage = 0;
        _this.device = device;
        _this.url = "http://" + device.ip + "/update";
        _this.filename = filename;
        fs.readFile(filename, function (e, d) {
            if (d) {
                _this.updateSize = d.length;
                _this.doUpdate();
            }
        });
        return _this;
    }
    ESPUpdater.prototype.doUpdate = function () {
        var _this = this;
        var req = request.post(this.url, function (err, resp, body) {
            //clearInterval(this.progressUpdater);
            if (body) {
                console.log(_this.device.ip + "\t" + body);
                _this.doneUpdate();
            }
            else {
                console.log({ err: err, resp: resp, body: body });
            }
        });
        var form = req.form();
        form.append('file', fs.createReadStream(this.filename));
        this.progressUpdater = setInterval(function () {
            _this.percentage = Math.round(req.req.connection._bytesDispatched / _this.updateSize * 100);
            console.log(_this.device.ip + "\tProgress: " + _this.percentage + "%");
        }, 1000);
    };
    ESPUpdater.prototype.doneUpdate = function () {
        clearInterval(this.progressUpdater);
    };
    return ESPUpdater;
}(events_1.EventEmitter));
exports.ESPUpdater = ESPUpdater;
var espIpList = [{ ip: "192.168.1.170" }, { ip: "192.168.1.128" }];
var filename = "./esp32master.ino.esp32.bin";
for (var _i = 0, espIpList_1 = espIpList; _i < espIpList_1.length; _i++) {
    var esp = espIpList_1[_i];
    var updater = new ESPUpdater(esp, filename);
}
