import { isConstructorDeclaration } from "typescript";
import { EventEmitter } from "events";


var fs = require("fs")
var request = require("request")

// This script lets you update ESP32 from nodejs.
export class ESPUpdater extends EventEmitter {
  device: any;
  url: any;
  updateSize = 0;
  progressUpdater: any;
  filename: any = "";
  percentage = 0;

  constructor(device, filename) {
    super();
    this.device = device;
    this.url = "http://" + device.ip + "/update"
    this.filename = filename;

    fs.readFile(filename, (e, d) => {
      if (d) {
        this.updateSize = d.length;
        this.doUpdate();
      }
    })
  }

  doUpdate() {
    var req = request.post(this.url, (err, resp, body) => {

      //clearInterval(this.progressUpdater);
      if (body) {
        console.log(this.device.ip + "\t" + body);
        this.doneUpdate();
      } else {
        console.log({ err, resp, body });
      }
    });

    var form = req.form();
    form.append('file', fs.createReadStream(this.filename));

    this.progressUpdater = setInterval(() => {
      this.percentage = Math.round(req.req.connection._bytesDispatched / this.updateSize * 100);
      console.log(this.device.ip + "\tProgress: " + this.percentage + "%");
    }, 1000)
  }

  doneUpdate() {
    clearInterval(this.progressUpdater);
  }
}




var espIpList = [{ ip: "192.168.1.170" }, { ip: "192.168.1.128" }]

var filename = "./esp32master.ino.esp32.bin"

for (var esp of espIpList) {
  var updater = new ESPUpdater(esp, filename);
}