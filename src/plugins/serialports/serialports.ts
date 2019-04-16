import * as SerialPort from "serialport";
import * as events from "events";
import { knownDeviceList } from "./knownDeviceList";
import { callbackify } from "util";
import { Plugin } from "../plugin";

var _ = require("lodash");

var sp: SerialPorts;

// var usbDetect = require('usb-detection');
// usbDetect.startMonitoring();

export const name = "serialports";

export const workflowDefinitions = [
  "var serialports = { ",
  "write: (comName:string, data:string, cb:Function)=>{},",
  "blah: (comName:string, data:string, cb:Function)=>{},",
  "list: ()",
  "}"
];

export const workflow = {
  write: writeToPort,
  list: listPorts
};

export function writeToPort(comName: string, data: string, cb: Function) {
  console.log("writeToPort")
  sp.write(comName, data, cb);
  
  
  
  
}

export function listPorts() {
  return sp.listOfPluggedInDevices;
}

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

export class SerialPorts extends events.EventEmitter {
  public listOfPluggedInDevices: any = [];
  public listofConnectedPorts: SerialJSONDevice[] = [];

  constructor() {
    super();
  }

  /* start of scan() */
  scan(cb: any) {
    this.list((allports: any) => {
      this.listOfPluggedInDevices = [];
      for (var port in allports) {
        if (allports[port].comName) {
          this.listOfPluggedInDevices.push(allports[port]);
        }
        /*
        for (var knownDevice in knownDeviceList) {
          if (allports[port].comName == knownDeviceList[knownDevice].comName) {
            //console.log("Found port");
            //console.log(allports[port])
            var thisDev = allports[port];
            thisDev.baudRate = knownDeviceList[knownDevice].baudRate;
            this.listOfPluggedInDevices.push(allports[port]);
          }
        }*/
      }
      cb();
    });
  }

  async list(cb: any) {
    var serialportList = await SerialPort.list();
    cb(serialportList);
  }

  connectDevices() {
    //connects to all known devices

    for (var device in this.listOfPluggedInDevices) {
      var alreadyPlugged = false;

      for (var port in this.listofConnectedPorts) {
        if (
          this.listOfPluggedInDevices[device].comName ==
          this.listofConnectedPorts[port].device.comName
        ) {
          alreadyPlugged = true;
        }
      }

      if (alreadyPlugged === false) {
        //var dev = new SerialJSONDevice(this.listOfPluggedInDevices[device].comName, { baudRate: this.listOfPluggedInDevices[device].baudRate})

        var dev = new SerialJSONDevice(this.listOfPluggedInDevices[device], {
          baudRate: 115200
        });

        dev.on("connect", device => {
          this.emit("connect", device);
        });

        this.listofConnectedPorts.push(dev);
        dev.on("json", json => {
          //console.log(json)
          this.emit("data", json);
        });
        dev.on("close", err => {
          this.listofConnectedPorts = this.listofConnectedPorts.filter(
            (device: any) => {
              device.comName == dev.device.comName;
            }
          );

          // for (var port in this.listofConnectedPorts) {
          //   if (this.listofConnectedPorts[port].device.comName == dev.device.comName) {
          //     console.log("found disconnected port")
          //   }
          // }

          this.emit("close", { err: err, device: dev.device });
        });
      }
    }
  }
  /* end of scan() */
  broadcast(data: any) {
    for (var d in this.listofConnectedPorts) {
      this.listofConnectedPorts[d].write(JSON.stringify(data));
    }
  }

  write(comName: string, data: string, cb: Function) {

    for (var device of this.listofConnectedPorts) {
      if (device.device.comName == comName) {
        console.log("found device")
        device.write(data);
        cb(undefined, "success");
        return;
      }
    }

    cb("not found", undefined);
  }
}

declare namespace SerialPortCustom {
  interface PortConfig {
    comName: string;
    manufacturer: string;
    serialNumber: string;
    pnpId: string;
    locationId: string;
    vendorId: string;
    productId: string;
  }
}

export class SerialJSONDevice extends events.EventEmitter {
  mybuffer: string = "";
  port: any;
  device: SerialPortCustom.PortConfig;

  constructor(device: any, options: SerialPort.OpenOptions) {
    super();

    this.device = device;

    this.port = new SerialPort(device.comName, options, err => {
      if (err) {
        console.error(err);
      } else {
        this.emit("connect", device);
      }
    });

    this.port.on("data", (data: any) => {
      this.mybuffer += data.toString();

      if (this.mybuffer.indexOf("\r") > 0) {
        var splitbuffer = this.mybuffer.split("\r");
        var cleanoutput = splitbuffer[0].split("\n").join("");
        this.emit("serial", cleanoutput);

        var err;
        var parsedJson;
        try {
          parsedJson = JSON.parse(cleanoutput);
        } catch (err) {}
        var jsonData = {
          device: this.device,
          options: options,
          raw: cleanoutput,
          datajson: parsedJson,
          err: err
        };

        /*
        comName:{ serialport.comName}<br /> 
        manufacturer: { serialport.manufacturer}<br />
        comName: { serialport.comName}<br />
        productId: { serialport.productId}<br />
        vendorId: { serialport.vendorId}<br />
        */

        //console.log(jsonData);
        this.emit("json", jsonData);

        this.mybuffer = splitbuffer[1];
      }
    });

    this.port.on("close", (err: Error) => {
      this.emit("close", err);
    });

    this.port.on("open", () => {
      console.log("event open");
    });
  }

  write(data: any) {
    console.log("writing to port")
    console.log(data);
    this.port.write(data + "\n");
    //return "Hello, " + this.comName;
  }
}



export function init(app: any, db: any, eventHub: events.EventEmitter) {
  console.log("initializing serialports");

  sp = new SerialPorts();

  sp.on("connect", device => {
    console.log("--- connect ---");
    updateserialportdevice(db, device, (err: Error, res: any) => {});
    //console.log(device);
    //eventHub.emit("device",{apikey:"cp3rrhjeryufe2xnlsxk7yooxat2m3rj", packet: {id:"testSerial", data:{a:1}}    })
  });

  sp.on("data", data => {
    var packet = {
      id: data.device.comName.split("/").join(""),
      data: data,
      meta: { method: "serialport" }
    };

    packet.data.connected = true;
    packet.data.err = "";
    //delete packet.data["serialNumber"]
    //delete packet.data["locationId"]

    getserialportconfig(db, data.device, (err: any, config: any) => {
      if (config == null) {
        return;
      }
      if (config.apikey) {
        eventHub.emit("device", { apikey: config.apikey, packet: packet });

        //////
        try {
          if (data.datajson.id) {
            eventHub.emit("device", {
              apikey: config.apikey,
              packet: {
                id: data.datajson.id,
                level: 1,
                data: data.datajson.data,
                serial: data,
                meta: { method: "serialport" }
              }
            });

            try {
              var rx = JSON.parse(data.datajson.rx.buf);

              if (rx.id) {
                eventHub.emit("device", {
                  apikey: config.apikey,
                  packet: {
                    id: rx.id,
                    level: 2,
                    data: rx.data,
                    serial: data,
                    meta: { method: "serialportRxTx" }
                  }
                });
              }
            } catch (err) {}
          }
        } catch (err) {}
        //////
      }
    });
  });

  sp.on("close", data => {
    var error = data.err.toString();

    if (error == "Error: bad file descriptor") {
      error = "Unplugged";
    }

    var packet = {
      id: data.device.comName.split("/").join(""),
      data: {
        connected: false,
        err: error
      },
      meta: { method: "serialport" }
    };

    getserialportconfig(db, data.device, (err: any, config: any) => {
      if (config == null) {
        return;
      }
      if (config.apikey) {
        eventHub.emit("device", { apikey: config.apikey, packet: packet });
      }
    });
  });

  setInterval(() => {
    sp.scan(() => {
      //console.log(sp.listOfPluggedInDevices);
      sp.connectDevices();
    });
  }, 2500);

  sp.scan(() => {
    //console.log(sp.listOfPluggedInDevices);
    sp.connectDevices();
  });

  app.get("/api/v3/serialports", (req: any, res: any) => {
    db.plugins_serialports.find({}, (err: any, devicelist: any) => {
      res.json(devicelist);
    });
    //res.json(sp.listOfPluggedInDevices)
  });

  app.post("/api/v3/serialports/setserialportaccount", (req: any, res: any) => {
    setserialportaccount(db, req.body, req.user, (err: Error, result: any) => {
      if (err) res.json(err);
      res.json(result);
    });
  });

  app.post("/api/v3/serialports/connect", (req:any, res:any)=>{
    console.log(req.body)
    if (typeof req.body.connect == "undefined") {
      req.body.connect = true;
    } 
    setSerialportConnect(db, req.body, req.user, req.body.connect, (err:Error, result:any) => {
      if (err) res.json(err);
      res.json(result);
    })

  })
}

















function setSerialportConnect(db: any, device: any, user: any, connect:boolean, cb: any) {
  updateserialportdevice(db, {comName: device.comName, connect:connect}, cb)
}















function setserialportaccount(db: any, device: any, user: any, cb: any) {
  db.plugins_serialports.update(
    { comName: device.comName },
    { $set: { apikey: user.apikey } },
    (err: Error, resultUpd: any) => {
      if (err) cb(err, undefined);
      if (resultUpd) {
        cb(undefined, resultUpd);
      }
    }
  );
}






function updateserialportdevice(db: any, device: any, cb: any) {
  db.plugins_serialports.findOne(
    { comName: device.comName },
    (err: any, devicedb: any) => {
      var newdevice: any = {};

      if (devicedb == null) {
        newdevice = _.clone(device);
      } else {
        newdevice = _.merge(devicedb, device);
      }

      db.plugins_serialports.update(
        { comName: newdevice.comName },
        newdevice,
        { upsert: true },
        (err: any, res: any) => {
          //console.log(res);
        }
      );
    }
  );
}









function getserialportconfig(db: any, device: any, cb: any) {
  db.plugins_serialports.findOne({ comName: device.comName }, cb);
}
