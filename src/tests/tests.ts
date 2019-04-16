// https://mochajs.org/#getting-started

import { log } from "../utils"
import { describe, it } from "mocha";
import * as trex from "../utils";
const Cryptr = require('cryptr');
const cryptr = new Cryptr('prototype');
var testAccount = {
  email: "",
  password: cryptr.encrypt("newUser"),
  apikey: "",
  server: "http://localhost",
  port: 8080,
  testDev: "testDeviceDEV"
}

import * as http from "http";

describe("API", function () {
  describe("REST API", function () {
    var testvalue: any;

    /************************************   Register   ****************************************/

    it("/api/v3/admin/register", function (done: any) {
      var randomNumberEmail = generateDifficult(32);
      var emaillocal = "test" + randomNumberEmail + "@iotlocalhost.com";
      const Account: any = { email: emaillocal.toLowerCase(), pass: testAccount.password };

      trex.restJSON(
        {
          path: testAccount.server + "/api/v3/admin/register",
          method: "POST",
          body: Account,
          port: testAccount.port,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        },
        (err: Error, result: any, account: any) => {
          if (err) {
            done(err);
          }
          if (result) {
            if (result.error) {
              done(new Error(result.error));
            }
            else {
              testAccount.email = result.account.email;
              testAccount.apikey = result.account.apikey;
              done();
            }
          }
        }
      );
    });

    /************************************   Account   ****************************************/

    it("/api/v3/account", function (done: any) {

      const options = {
        hostname: "localhost",
        port: testAccount.port,
        path: "/api/v3/account",
        method: "GET",
        headers: {
          Authorization:
            "Basic " + Buffer.from("api:key-" + testAccount.apikey).toString("base64"),
          "Content-Type": "application/json"
        }
      };
      // CREATE REQUEST OBJECT
      const req = http.request(options, res => {
        var response = "";
        res.setEncoding("utf8");
        res.on("data", chunk => {
          response += chunk;
        });
        res.on("end", () => {
          var result = JSON.parse(response);

          if (result.error) {
            done(new Error(result.error));
          } else if (result.apikey == testAccount.apikey) {
            done();
          }
        });
      });

      req.on("error", e => {
        console.error(`problem with request: ${e.message}`);
      });
      req.end();
    });

    /************************************   Recover Password   ****************************************/
    // COMMENT: ROUAN : this breaks on systems without SMTP email settings set.

    // it("/api/v3/ForgetPassword", function (done: any) {
    //   const Account: any = { email: testAccount.email };

    //   this.timeout(4000)

    //   trex.restJSON(
    //     {
    //       path: testAccount.server + ":" + testAccount.port + "/api/v3/ForgetPassword",
    //       method: "POST",
    //       body: Account,
    //       headers: {
    //         "Accept": "application/json",
    //         "Content-Type": "application/json"
    //       }
    //     },
    //     (error: Error, result: any) => {
    //       console.log(result)
    //       if (error != null) {
    //         done(error);
    //       }
    //       if (result) {
    //         //done();
    //         trex.restJSON(
    //           {
    //             path: testAccount.server + "/api/v3/admin/recoverEmailLink",
    //             method: "POST",
    //             body: Account,
    //             port: testAccount.port,
    //             headers: {
    //               "Accept": "application/json",
    //               "Content-Type": "application/json"
    //             }
    //           },
    //           (err: Error, result: any) => {
    //             var infor = result.result.info;
    //             if (err) {
    //               done(err);
    //             } else if (infor.rejected.length < 1) {
    //               for (var email in infor.accepted) {
    //                 if (testAccount.email == infor.accepted[email]) {
    //                   done();
    //                 } else {
    //                   done(new Error("Did not fine your email in the accepted emails list."));
    //                 }
    //               }
    //             } else {
    //               done(new Error("The email was rejected."));
    //             }
    //           }
    //         );
    //       }
    //     }
    //   );
    // });

    /************************************   Sign In   ****************************************/

    it("/signIn", function (done: any) {
      const Account: any = { email: testAccount.email, pass: testAccount.password };

      trex.restJSON(
        {
          path: testAccount.server + ":" + testAccount.port + "/signIn",
          method: "POST",
          body: Account,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        },
        (err: Error, result: any, account: any) => {
          if (err) {
            done(err);
          }
          if (result) {
            if (result.error) {
              done(new Error(result.error));
            }
            else if (result.signedin == true) {
              done();
            }
          }
        }
      );
    });

    /************************************   Version   ****************************************/

    it("/api/v3/version", function (done: any) {
      const options = {
        hostname: "localhost",
        port: testAccount.port,
        path: "/api/v3/version",
        method: "GET",
        headers: {
          Authorization:
            "Basic " + Buffer.from("api:key-test").toString("base64"),
          "Content-Type": "application/json"
        }
      };
      // CREATE REQUEST OBJECT
      const req = http.request(options, res => {
        var response = "";
        res.setEncoding("utf8");
        res.on("data", chunk => {
          response += chunk;
        });
        res.on("end", () => {
          if (JSON.parse(response).version) {
            done();
          }
        });
      });

      req.on("error", e => {
        console.error(`problem with request: ${e.message}`);
      });
      req.end();
    });

    /************************************   Post   ****************************************/
    it("/api/v3/data/post", function (done: any) {
      testvalue = "DEV" + Math.round(Math.random() * 1000);
      var testDevice: any = {
        id: testAccount.testDev,
        data: { someval: testvalue, gps: { lat: 25.566, lon: -25.39955 } }
      };


      trex.restJSON(
        {
          apikey: testAccount.apikey,
          method: "POST",
          path: testAccount.server + ":" + testAccount.port + "/api/v3/data/post",
          body: testDevice,
          port: testAccount.port
        },
        (err: Error, result: any) => {
          if (err) {
            done(err);
          }
          if (result) {
            if (result.error) {
              done(new Error(result.error))
            } else {
              if (result.result == "success") {
                // mqttconnection.on("connect", () => {
                //   mqttconnection.postData();
                //   clearTimeout(timeout)
                done()
                // })
              } else {
                var timeout = setTimeout(() => {
                  done("error timeout")
                }, 6000)
                done(result);
              }
            }
          }
        }
      );
    });

    /************************************   Geo Location   ****************************************/
    // cant test with localhost..
    // it("/api/v3/getlocation", function (done: any) {
    //   console.log("-----")
    //   trex.restJSON(
    //     {
    //       apikey: testAccount.apikey,
    //       path: testAccount.server + ":" + testAccount.port + "/api/v3/getlocation",
    //       method: "GET",
    //       headers: {
    //         "Accept": "application/json",
    //         "Content-Type": "application/json"
    //       }
    //     },(err: Error, result: any) => {
    //       console.log(err)
    //       console.log(result)


    //     }
    //   );
    // });

    /************************************   VIEW   ****************************************/

    it("/api/v3/view", function (done: any) {
      var testDevice: any = { id: testAccount.testDev };
      trex.restJSON(
        {
          apikey: testAccount.apikey,
          method: "POST",
          path: testAccount.server + "/api/v3/view",
          body: testDevice,
          port: testAccount.port
        },
        (err: Error, result: any) => {
          if (err) {
            done(err);
          }
          if (result) {

            if (result.error) { done(new Error(result.error)); }

            if (result.data.someval == testvalue) {

              done();
            }
          }
        }
      );
    });

    /************************************   Packets   ****************************************/

    it("/api/v3/packets", function (done: any) {
      var testDevice: any = { id: testAccount.testDev };
      trex.restJSON(
        {
          apikey: testAccount.apikey,
          method: "POST",
          path: testAccount.server + "/api/v3/packets",
          body: testDevice,
          port: testAccount.port
        },
        (err: Error, result: any) => {
          if (err) {
            done(err);
          }
          if (result) {
            if (result.error) { done(new Error(result.error)); }
            //if (result.data.someval == testvalue) { done(); }
            if (result[result.length - 1].data.someval == testvalue) {

              done();
            }
          }
        }
      );
    });

    /************************************   STATE   ****************************************/

    it("/api/v3/state", function (done: any) {
      const postData = JSON.stringify({ id: testAccount.testDev });
      const options = {
        hostname: "localhost",
        port: testAccount.port,
        path: "/api/v3/state",
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from("api:key-" + testAccount.apikey).toString("base64"),
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData)
        }
      };
      // CREATE REQUEST OBJECT
      const req = http.request(options, res => {
        var response = "";
        res.setEncoding("utf8");
        res.on("data", chunk => {
          response += chunk;
        });
        res.on("end", () => {
          //if (JSON.parse(response).version) { done(); }
          var result = JSON.parse(response);
          if (result.error) { done(new Error(result.error)); }


          if (JSON.parse(response).payload.data.someval == testvalue) {
            done();
          }
        });
      });

      req.on("error", e => {
        console.error(`problem with request: ${e.message}`);
      });
      req.write(postData);
      req.end();
    });

    /************************************   States   ****************************************/

    it("/api/v3/states", function (done: any) {
      const postData = JSON.stringify({ id: testAccount.testDev });
      const options = {
        hostname: "localhost",
        port: testAccount.port,
        path: "/api/v3/states",
        method: "GET",
        headers: {
          Authorization:
            "Basic " + Buffer.from("api:key-" + testAccount.apikey).toString("base64"),
          "Content-Type": "application/json"
        }
      };
      // CREATE REQUEST OBJECT
      const req = http.request(options, res => {
        var response = "";
        res.setEncoding("utf8");
        res.on("data", chunk => {
          response += chunk;
        });
        res.on("end", () => {
          var result = JSON.parse(response);

          if (result.error) { done(new Error(result.error)); }

          for (var d in result) {
            if (result[d].id == "testDeviceDEV") {
              if (result[d].data.someval == testvalue) {

                done();
              }
            }
          }
        });
      });

      req.on("error", e => {
        console.error(`problem with request: ${e.message}`);
      });
      req.end();
    });

    /************************************   Delete   ****************************************/

    it("/api/v3/state/delete", function (done: any) {
      const postData = JSON.stringify({ id: testAccount.testDev });

      const options = {
        hostname: "localhost",
        port: testAccount.port,
        path: "/api/v3/state/delete",
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from("api:key-" + testAccount.apikey).toString("base64"),
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData)
        }
      };
      // CREATE REQUEST OBJECT
      const req = http.request(options, res => {
        var response = "";
        res.setEncoding("utf8");
        res.on("data", chunk => {
          response += chunk;
        });
        res.on("end", () => {
          var result = JSON.parse(response);

          if (result.error) {
            done(new Error(result.error));
          } else {
            done();
          }
        });
      });

      req.on("error", e => {
        console.error(`problem with request: ${e.message}`);
      });
      req.write(postData);
      req.end();
    });
  });

  describe("MQTT+SOCKETS+REST API", function () {

    /************************************   MQTT+SOCKETS+REST API   ****************************************/
    it("/api/v3/data/post + SOCKETS + MQTT", function (done: any) {
      this.timeout(6000)
      var mqtt = require('mqtt');
      var client = mqtt.connect('mqtt://localhost', { username: "api", password: "key-" + testAccount.apikey });

      var randomnumber = Math.round(Math.random() * 10000)

      var socket = require("socket.io-client")(testAccount.server + ":" + testAccount.port)

      var counter = 0;

      var mqttpacket: any;
      var socketpacket: any;
      var originalData: any;

      function checkSuccess() {
        if (counter == 2) {
          comparePackets();
        }
      }

      function comparePackets() {
        if (mqttpacket === socketpacket) {
          if (mqttpacket === originalData) {
            if (socketpacket === originalData) {
              if (socket.disconnect()) {
                if (client.end()) {
                  done();
                }
              }
            } else {
              done(new Error("Original Data sent and Socket packets recieved not the same!"))
            }
          } else {
            done(new Error("Original Data sent and Mqtt packets recieved not the same!"))
          }
        } else {
          done(new Error("Mqtt and Socket packets recieved not the same!"))
        }
      }

      /*************************** Socket Connect *************************************/

      socket.on("connect", () => {
        socket.emit("join", testAccount.apikey);

        /*************************** MQTT Connect *************************************/

        client.on('connect', function () {

          var dataVar = { random: randomnumber, temp: { cold: Math.round(Math.random() * 10000), hot: Math.round(Math.random() * 10000) }, gps: { lat: 25.566, lon: -25.39955 } };
          /*************************** Http POST *************************************/
          trex.restJSON(
            {
              apikey: testAccount.apikey,
              method: "POST",
              path: testAccount.server + "/api/v3/data/post",
              body: { id: testAccount.testDev, data: dataVar },
              port: testAccount.port
            }, (err: Error, result: any) => {
              if (err) { done(err); }
            }
          );

          originalData = JSON.stringify(dataVar);

          client.subscribe(testAccount.apikey, function (err: any) {
            if (err) { done(err) }
          })

          client.on('message', function (topic: any, message: any) {
            //console.log(message+"-------mqtt")

            var t = JSON.parse(message.toString());
            mqttpacket = JSON.stringify(t.data);
            //console.log(mqttpacket+"---------------mqtt1")
            counter++;
            checkSuccess()
          })
        })
      });

      socket.on("post", (data: any) => {
        //console.log(JSON.stringify(data)+"-------------------socket")
        socketpacket = JSON.stringify(data.data);
        counter++;
        checkSuccess()
      });

    });

    /************************************   MQTT+SOCKETS+REST API   ****************************************/
    it("MQTT + /api/v3/data/post + SOCKETS", function (done: any) {
      this.timeout(6000)
      var mqtt = require('mqtt');

      var client = mqtt.connect('mqtt://localhost', { username: "api", password: "key-" + testAccount.apikey });
      var socket = require("socket.io-client")(testAccount.server + ":" + testAccount.port)

      var randomnumber = Math.round(Math.random() * 10000)
      var dataVar = { random: randomnumber, asdf: "123" };
      var counter = 0;

      var restpacket: any;
      var socketpacket: any;
      var originalData: any;

      function checkSuccess() {
        if (counter == 2) {
          comparePackets();
        }
      }

      function comparePackets() {
        if (restpacket === socketpacket) {
          if (restpacket === originalData) {
            if (socketpacket === originalData) {
              if (socket.disconnect()) {
                if (client.end()) {
                  done();
                }
              }
            } else {
              done(new Error("Original Data sent and Socket packets recieved not the same!"))
            }
          } else {
            done(new Error("Original Data sent and Mqtt packets recieved not the same!"))
          }
        } else {
          done(new Error("Mqtt and Socket packets recieved not the same!"))
        }
      }

      socket.on("connect", () => {
        socket.emit("join", testAccount.apikey);

        /*************************** MQTT Connect *************************************/

        client.on('connect', function () {
          client.subscribe(testAccount.apikey, function (err: any) {
            if (err) {
              console.log(err)
            } else {
              var testdevice = { id: "MQTTTESTDEV", data: dataVar }

              client.publish(testAccount.apikey, JSON.stringify(testdevice));

              originalData = JSON.stringify(dataVar);

              trex.restJSON(
                {
                  apikey: testAccount.apikey,
                  method: "POST",
                  path: testAccount.server + "/api/v3/view",
                  body: testdevice,
                  port: testAccount.port
                },
                (err: Error, result: any) => {
                  if (err) {
                    console.log(err)
                  } else {
                    restpacket = JSON.stringify(result.data)
                    // console.log(restpacket+"-----------Rest1")
                    counter++;
                  }
                }
              );
            }
          })
        })
      });

      socket.on("post", (data: any) => {
        socketpacket = JSON.stringify(data.data);
        counter++;
        checkSuccess()
      });

    });

    /************************************   MQTT+SOCKETS+REST API   ****************************************/
    it("SOCKETS  +  MQTT + /api/v3/data/post", function (done: any) {
      this.timeout(6000)
      var mqtt = require('mqtt');
      var client = mqtt.connect('mqtt://localhost', { username: "api", password: "key-" + testAccount.apikey });

      var socket = require("socket.io-client")("http://localhost:8080")

      var randomnumber = Math.round(Math.random() * 10000)
      var dataVar = {
        random: randomnumber,
        temp: { cold: 1, hot: 0 },
        gps: { lat: 25.566, lon: -25.39955 }
      };

      var counter = 0;

      var restpacket: any;
      var mqttpacket: any;
      var socketpacket: any;
      var originalData: any;

      socket.on("connect", () => {
        socket.emit("join", testAccount.apikey);

        /*************************** MQTT Connect *************************************/

        client.on('connect', function () {

          client.subscribe(testAccount.apikey, function (err: any) {
            if (err) {
              console.log(err)
            }
          })

          socket.emit("post", { id: testAccount.testDev, data: dataVar })
          originalData = JSON.stringify(dataVar);
          //console.log(originalData+"---------------------original data sent")
        })

        client.on('message', function (topic: any, message: any) {

          var t = JSON.parse(message.toString());
          mqttpacket = JSON.stringify(t.data);
          //console.log(message+"--------------------------mqtt")
          counter++;
          checkSuccess()
        })

      });

      socket.on("post", (data: any) => {
        var testDevice: any = { id: testAccount.testDev };

        trex.restJSON(
          {
            apikey: testAccount.apikey,
            method: "POST",
            path: testAccount.server + "/api/v3/view",
            body: testDevice,
            port: testAccount.port
          },
          (err: Error, result: any) => {
            if (err) {
              console.log(err)
            } else {
              restpacket = JSON.stringify(result.data)
              //console.log(JSON.stringify(result)+"----------------------------rest")
              counter++;
              checkSuccess();
            }
          }
        );
        socketpacket = JSON.stringify(data.data);
        //console.log(socketpacket+"--------------------------socket")
        counter++;
        checkSuccess()
      });

      function checkSuccess() {
        if (counter >= 3) {
          comparePackets();
        }
      }

      function comparePackets() {
        if (restpacket === socketpacket) {
          if (restpacket === originalData) {
            if (socketpacket === originalData) {
              if (mqttpacket === originalData) {
                if (socket.disconnect()) {
                  if (client.end()) {
                    done();
                  }
                }
              } else {
                done(new Error("Original Data sent and MQTT packets recieved not the same!"))
              }
            } else {
              done(new Error("Original Data sent and Socket packets recieved not the same!"))
            }
          } else {
            done(new Error("Original Data sent and Rest packets recieved not the same!"))
          }
        } else {
          done(new Error("Rest and Socket packets recieved not the same!"))
        }
      }
    });
  });

});

// describe("UI Test", function(){
//   describe("Landing Page", function(){
//     it('Contains Login Button', function(done: any){
//       done();
//     });
//   })

// });

function generateDifficult(count: number) {
  var _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  var str = '';
  for (var i = 0; i < count; i++) {
    var tmp = _sym[Math.round(Math.random() * (_sym.length - 1))];
    str += "" + tmp;
  }
  return str;
}
