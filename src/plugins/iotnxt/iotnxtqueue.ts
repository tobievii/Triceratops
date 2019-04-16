import * as events from 'events';
import * as mqtt from 'mqtt';
import * as crypto from 'crypto';

var file = "/src/plugins/iotnxxt/iotnxtqueue.ts"
import { log } from "../../utils"

var mqttcfg = {
  protocol: "mqtts://",
  port: ":8883"
}

/*
var mqttcfg = {
  protocol : "mqtt://",
  port: ":1883"
}
*/

export class IotnxtQueue extends events.EventEmitter {
  RoutingKeyBase: any;
  connected: boolean = false;

  state: any = { "deviceGroups": {} };

  GatewayId: string = "";
  secretkey: string = "";

  secret: any = {}; //red queue stuff

  hostaddress: string = "";
  Make: string = "";
  Model: string = "";
  FirmwareVersion: string = "";
  Location: any = undefined;

  Devices: any = {};
  GatewayFirstContact: boolean = false;
  IsIoTHubDevice: boolean = false;
  Config: any = {};
  ClientId: string = "";
  modulus: string = "";
  exponent: string = "";
  AES: any = {};

  mqttRed: mqtt.MqttClient | any;

  constructor(config: any, Devices: any, force: boolean) {
    super();

    this.GatewayId = config.GatewayId;
    this.hostaddress = config.hostaddress;

    this.Make = config.Make;
    this.Model = config.Model;
    this.FirmwareVersion = config.FirmwareVersion;

    if (config.Location) {
      this.Location = config.Location;
    }

    this.secretkey = config.secretkey

    this.modulus = config.publickey.split("<").join(',').split(">").join(',').split(',')[8];
    this.exponent = config.publickey.split("<").join(',').split(">").join(',').split(',')[4]

    this.Devices = Devices;

    genAESkeys((AES: any) => {
      this.AES = AES;
      this.connectGreenQ((err: Error, secret: any) => {
        if (err) {
          //this.emit('error', err);
          log(err);
        }
        if (secret) {
          this.connectRedQ((err: Error, result: any) => {
            if (err) console.log(err);
            if (result) {
              this.register((err: Error, result: any) => {

                //console.log("subscribe to routingkeybase")
                //console.log(this.secret.RoutingKeyBase);
                this.mqttRed.subscribe(this.secret.RoutingKeyBase + ".REQ", (err: Error) => {
                  if (err) console.log(err);
                });

                this.mqttRed.on('message', (topic: any, message: any) => {
                  //console.log("!!!!!!!!!!")
                  var json = JSON.parse(message.toString());
                  var payload = JSON.parse(Buffer.from(json.Payload, "base64").toString());
                  this.emit('request', payload);
                });


                this.emit('connect');

              });
            }
          });
        }
      });
    })

  }


  /* ################################################################################## */

  connectGreenQ(cb: any) {
    var greenOptions = {
      clientId: this.GatewayId + ".GREEN." + ((Date.now() * 10000) + 621355968000000000),
      username: "green1:public1",
      password: "publicpassword1",
      //rejectUnauthorized: false,
      //connectTimeout: 30 * 1000,
      //keepalive : 60
    }


    var replyKey = "MessageAuthNotify.".toUpperCase() + getGUID().toUpperCase();
    var mqttGreen = mqtt.connect(mqttcfg.protocol + this.hostaddress + mqttcfg.port, greenOptions);

    mqttGreen.on('error', (err: any) => { cb(err, undefined); })
    mqttGreen.on("offline", function (err: any) { cb(err, undefined); })
    mqttGreen.on("close", function (err: any) { cb(err, undefined); })

    mqttGreen.on('connect', () => {

      mqttGreen.subscribe(replyKey, { qos: 0 }, (err: any, granted: any) => {
        if (granted) {

          ///
          var messageAuthRequest = {
            Uid: this.GatewayId,
            SecretKey: this.secretkey,
            PostUtc: new Date().toISOString(),
            Headers: {}
          }

          var cipher = createCipheriv(this.AES);
          var textBuffer = Buffer.from(JSON.stringify(messageAuthRequest));
          var encrypted = cipher.update(textBuffer)
          var encryptedFinal = cipher.final()

          var newBuffer = Buffer.concat([encrypted, encryptedFinal]);

          var RSAcreds: RSAcredentials = {
            modulus: this.modulus,
            exponent: this.exponent
          }

          var wrappedMessage = {
            Payload: newBuffer.toString("base64"),
            IsEncrypted: true,
            Headers: {
              //SymKey: publicKeyRSA.encrypt(AES.key, "UTF8", "base64", ursa.RSA_PKCS1_PADDING).toString("base64"),
              SymIv: RSAENCRYPT(this.AES.iv, RSAcreds),
              SymKey: RSAENCRYPT(this.AES.key, RSAcreds)
            },
            PostUtc: new Date().toISOString(),
            ReplyKey: replyKey.toUpperCase()
          }

          //console.log(wrappedMessage)

          mqttGreen.publish("MESSAGEAUTHREQUEST", JSON.stringify(wrappedMessage), { qos: 1 }, function (err: any) {
            if (err) { console.error("publisherror:" + err) }
          });
          ///
        }
      });
    });



    mqttGreen.on('message', (topic: string, message: Buffer, packet: any) => {
      var json = JSON.parse(message.toString());
      var payload = Buffer.from(json.Payload, "base64");
      var decipher = createDecipheriv(this.AES);
      var result = Buffer.concat([decipher.update(payload), decipher.final()]);
      var secret = JSON.parse(result.toString());



      mqttGreen.end(undefined, () => {
        if (secret.Success == true) {
          //console.log(secret);
          this.secret = secret;
          cb(undefined, secret);
        } else {
          log("IOTNXT FAILED TO CONNECT [" + this.GatewayId + "] ErrorMsg:" + secret.ErrorMsg)
          if (secret.ErrorMsg) {
            cb(secret.ErrorMsg.split('\n')[0], undefined);
          } else {
            cb("invalid server response", undefined);
          }

        }

      })

    });
  }

  /* ################################################################################## */



  connectRedQ(cb: any) {

    var redoptions = {
      clientId: this.secret.ClientId + ".RED." + ((Date.now() * 10000) + 621355968000000000),
      username: this.secret.vHost + ":" + this.GatewayId,
      password: this.secret.Password,
      //rejectUnauthorized: false,
      //keepalive: 5
    }

    this.mqttRed = mqtt.connect(mqttcfg.protocol + this.secret.Hosts[0] + mqttcfg.port, redoptions);

    this.mqttRed.on('connect', () => {
      this.connected = true;
      cb(undefined, true);
    });

    this.mqttRed.on('reconnect', function () { console.log("Queue reconnected"); });
    this.mqttRed.on('close', function () { console.log("Queue disconnected"); });
    this.mqttRed.on('offline', function () { console.log("Queue has gone offline"); });

    this.mqttRed.on('error', function (error: any) {
      console.log("error: " + error);
    });

  }




  /* ################################################################################## */

  register(cb: any) {
    var packet = {
      "messageType": "Gateway.RegisterGatewayFromGateway.1",
      "args": {
        "gateway": {
          "GatewayId": this.GatewayId,
          "Make": this.Make,
          "Model": this.Model,
          //"FirmwareVersion": "1.0.1",//this.FirmwareVersion,
          "FirmwareVersion": this.FirmwareVersion,
          "Location": this.Location,
          "Secret": this.secretkey,
          "Devices": this.Devices,
          "GatewayFirstContact": false,
          "IsIoTHubDevice": false,
          "ClientId": this.ClientId
        }
      },
      "expiresAt": new Date(new Date().getTime() + 15 * 1000).toISOString()
    }

    // console.log("=============================== !!!!")
    //console.log(JSON.stringify(packet, null, 2));

    var textBuffer = Buffer.from(JSON.stringify(packet));

    var wrappedMessage = {
      Payload: textBuffer.toString("base64"),
      IsEncrypted: false,
      Headers: {},
      PostUtc: new Date().toISOString(),
      ReplyKey: "DAPI.1.DAPI.REPLY.1." + this.secret.ClientId.toUpperCase() + "." + getGUID().toUpperCase() + "." + getGUID().toUpperCase()
    }


    var subtopic = wrappedMessage.ReplyKey.toUpperCase(); //.split(".").join("/").toUpperCase();
    var topic = "DAPI.1.Gateway.RegisterGatewayFromGateway.1." + this.secret.ClientId + ".DEFAULT"



    this.mqttRed.publish(topic.toUpperCase(), JSON.stringify(wrappedMessage), function (err: any) {
      if (err) {
        console.log("ERROR:");
        console.log(err);
      } else {
        cb(undefined, true); //SUCCESS
      }
    });

  }

  /* ################################################################################## */

  public clearState() {
    this.state = {};
  }

  public updateState(route: any, property: any, data: any) {

    //iotnxt.updateState(this.state, route, property, data );
    if (!this.state.deviceGroups) { this.state.deviceGroups = {}; }
    if (!this.state.deviceGroups[route]) { this.state.deviceGroups[route] = {}; }
    var before = this.state.deviceGroups[route][property];
    this.state.deviceGroups[route][property] = data;

    if (before != data) {
      return { updated: 1 }
    } else {
      return { updated: 0 }
    }

  }

  /* ################################################################################## */

  public publishState(cb: any) {


    var packet = JSON.parse(JSON.stringify(this.state));
    ///////

    packet.CommandText = "DigiTwin.Notification";
    packet.Headers = {
      "FileName": "",
      "Version": "2.15.0",
      "Raptor": "000000000000"
    };

    var dateNow = new Date();
    var fromUtc = new Date(dateNow.getTime() - 15 * 1000)

    packet.MessageId = getGUID();
    packet.PostUtc = dateNow.toISOString();
    packet.MessageSourceId = null;
    packet.fromUtc = fromUtc.toISOString();
    packet.sourceMessageID = getGUID();

    //console.log(packet);

    var textBuffer = Buffer.from(JSON.stringify(packet));

    var wrappedMessage = {
      Payload: textBuffer.toString("base64"),
      IsEncrypted: false,
      Headers: {},
      PostUtc: new Date().toISOString()
    }

    //Persist state before sending
    //PersistenceService.insert(packet)

    try {

      var routingkey = this.secret.RoutingKeyBase + ".NFY"
      //console.log(routingkey)
      this.mqttRed.publish(routingkey, JSON.stringify(wrappedMessage), { qos: 0 }, function (err: Error) {

        if (err) {
          console.log("ERROR:" + err)
          cb(err, undefined);
        } else {
          cb(undefined, true);
        }

      });

    } catch (err) {
      console.error(`Failed to publish packet - \n Error : [${err}] \n [${JSON.stringify(wrappedMessage)}]`);
    }


  }

  /* ################################################################################## */

  public registerEndpoints(deviceTree: any, cb: Function) {
    console.log(this.GatewayId + " REGISTERING")

    this.Devices = deviceTree;
    this.register(cb);
    //iotnxt.reRegister(deviceTree, cb)
  }

}


export interface RSAcredentials {
  modulus: string,
  exponent: string
}

export function RSAENCRYPT(text: string, credentials: RSAcredentials) {
  // https://stackoverflow.com/questions/27568570/how-to-convert-raw-modulus-exponent-to-rsa-public-key-pem-format

  var publicKey = RSAgenPEM(credentials.modulus, credentials.exponent);
  var buffer = Buffer.from(text);

  var rsakey = {
    key: publicKey,
    padding: 1 //crypto.constants.RSA_PKCS1_PADDING  
  }

  //An optional padding value defined in crypto.constants, which may be: crypto.constants.RSA_NO_PADDING, RSA_PKCS1_PADDING, or crypto.constants.RSA_PKCS1_OAEP_PADDING.

  var encrypted = crypto.publicEncrypt(rsakey, buffer);
  return encrypted.toString("base64");
}

export function RSAgenPEM(modulus: string, exponent: string) {
  // by Rouan van der Ende
  // converts a raw modulus/exponent public key to a PEM format.

  var header = Buffer.from("MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA", 'base64'); //Standard header
  var mod = Buffer.from(modulus, 'base64');
  var midHeader = Buffer.from([0x02, 0x03]);
  var exp = Buffer.from(exponent, 'base64');

  //combine
  var key = Buffer.concat([header, mod, midHeader, exp])
  var keybase64 = key.toString("base64");

  var PEM = "-----BEGIN PUBLIC KEY-----\r\n"

  for (var a = 0; a <= Math.floor(keybase64.length / 64); a++) {
    PEM += keybase64.slice(0 + (64 * a), 64 + (64 * a)) + "\r\n";
  }

  PEM += "-----END PUBLIC KEY-----\r\n"

  return PEM;
}

export function genAESkeys(callback: any) {
  crypto.pseudoRandomBytes(32, function (err, keyBuffer) {
    crypto.pseudoRandomBytes(16, function (err, ivBuffer) {
      callback({ key: keyBuffer, iv: ivBuffer });
    });
  });
}

export function createCipheriv(AES: any, algorithm: string = "aes-256-cbc"): crypto.Cipher {
  return crypto.createCipheriv(algorithm, AES.key, AES.iv);
}

export function createDecipheriv(AES: any, algorithm: string = "aes-256-cbc"): crypto.Decipher {
  return crypto.createDecipheriv(algorithm, AES.key, AES.iv);
}


export function getGUID() {
  var d = new Date().getTime();
  var uuid: string = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
};