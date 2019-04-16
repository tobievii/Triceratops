"use strict";
// https://mochajs.org/#getting-started
exports.__esModule = true;
var mocha_1 = require("mocha");
var trex = require("../utils");
var Cryptr = require('cryptr');
var cryptr = new Cryptr('prototype');
var testAccount = {
    email: "",
    password: cryptr.encrypt("newUser"),
    apikey: "",
    server: "http://localhost",
    port: 8080,
    testDev: "testDeviceDEV"
};
var http = require("http");
mocha_1.describe("API", function () {
    mocha_1.describe("REST API", function () {
        var testvalue;
        /************************************   Register   ****************************************/
        mocha_1.it("/api/v3/admin/register", function (done) {
            var randomNumberEmail = generateDifficult(32);
            var emaillocal = "test" + randomNumberEmail + "@iotlocalhost.com";
            var Account = { email: emaillocal.toLowerCase(), pass: testAccount.password };
            trex.restJSON({
                path: testAccount.server + "/api/v3/admin/register",
                method: "POST",
                body: Account,
                port: testAccount.port,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            }, function (err, result, account) {
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
            });
        });
        /************************************   Account   ****************************************/
        mocha_1.it("/api/v3/account", function (done) {
            var options = {
                hostname: "localhost",
                port: testAccount.port,
                path: "/api/v3/account",
                method: "GET",
                headers: {
                    Authorization: "Basic " + Buffer.from("api:key-" + testAccount.apikey).toString("base64"),
                    "Content-Type": "application/json"
                }
            };
            // CREATE REQUEST OBJECT
            var req = http.request(options, function (res) {
                var response = "";
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    response += chunk;
                });
                res.on("end", function () {
                    var result = JSON.parse(response);
                    if (result.error) {
                        done(new Error(result.error));
                    }
                    else if (result.apikey == testAccount.apikey) {
                        done();
                    }
                });
            });
            req.on("error", function (e) {
                console.error("problem with request: " + e.message);
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
        mocha_1.it("/signIn", function (done) {
            var Account = { email: testAccount.email, pass: testAccount.password };
            trex.restJSON({
                path: testAccount.server + ":" + testAccount.port + "/signIn",
                method: "POST",
                body: Account,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            }, function (err, result, account) {
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
            });
        });
        /************************************   Version   ****************************************/
        mocha_1.it("/api/v3/version", function (done) {
            var options = {
                hostname: "localhost",
                port: testAccount.port,
                path: "/api/v3/version",
                method: "GET",
                headers: {
                    Authorization: "Basic " + Buffer.from("api:key-test").toString("base64"),
                    "Content-Type": "application/json"
                }
            };
            // CREATE REQUEST OBJECT
            var req = http.request(options, function (res) {
                var response = "";
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    response += chunk;
                });
                res.on("end", function () {
                    if (JSON.parse(response).version) {
                        done();
                    }
                });
            });
            req.on("error", function (e) {
                console.error("problem with request: " + e.message);
            });
            req.end();
        });
        /************************************   Post   ****************************************/
        mocha_1.it("/api/v3/data/post", function (done) {
            testvalue = "DEV" + Math.round(Math.random() * 1000);
            var testDevice = {
                id: testAccount.testDev,
                data: { someval: testvalue, gps: { lat: 25.566, lon: -25.39955 } }
            };
            trex.restJSON({
                apikey: testAccount.apikey,
                method: "POST",
                path: testAccount.server + ":" + testAccount.port + "/api/v3/data/post",
                body: testDevice,
                port: testAccount.port
            }, function (err, result) {
                if (err) {
                    done(err);
                }
                if (result) {
                    if (result.error) {
                        done(new Error(result.error));
                    }
                    else {
                        if (result.result == "success") {
                            // mqttconnection.on("connect", () => {
                            //   mqttconnection.postData();
                            //   clearTimeout(timeout)
                            done();
                            // })
                        }
                        else {
                            var timeout = setTimeout(function () {
                                done("error timeout");
                            }, 6000);
                            done(result);
                        }
                    }
                }
            });
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
        mocha_1.it("/api/v3/view", function (done) {
            var testDevice = { id: testAccount.testDev };
            trex.restJSON({
                apikey: testAccount.apikey,
                method: "POST",
                path: testAccount.server + "/api/v3/view",
                body: testDevice,
                port: testAccount.port
            }, function (err, result) {
                if (err) {
                    done(err);
                }
                if (result) {
                    if (result.error) {
                        done(new Error(result.error));
                    }
                    if (result.data.someval == testvalue) {
                        done();
                    }
                }
            });
        });
        /************************************   Packets   ****************************************/
        mocha_1.it("/api/v3/packets", function (done) {
            var testDevice = { id: testAccount.testDev };
            trex.restJSON({
                apikey: testAccount.apikey,
                method: "POST",
                path: testAccount.server + "/api/v3/packets",
                body: testDevice,
                port: testAccount.port
            }, function (err, result) {
                if (err) {
                    done(err);
                }
                if (result) {
                    if (result.error) {
                        done(new Error(result.error));
                    }
                    //if (result.data.someval == testvalue) { done(); }
                    if (result[result.length - 1].data.someval == testvalue) {
                        done();
                    }
                }
            });
        });
        /************************************   STATE   ****************************************/
        mocha_1.it("/api/v3/state", function (done) {
            var postData = JSON.stringify({ id: testAccount.testDev });
            var options = {
                hostname: "localhost",
                port: testAccount.port,
                path: "/api/v3/state",
                method: "POST",
                headers: {
                    Authorization: "Basic " + Buffer.from("api:key-" + testAccount.apikey).toString("base64"),
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(postData)
                }
            };
            // CREATE REQUEST OBJECT
            var req = http.request(options, function (res) {
                var response = "";
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    response += chunk;
                });
                res.on("end", function () {
                    //if (JSON.parse(response).version) { done(); }
                    var result = JSON.parse(response);
                    if (result.error) {
                        done(new Error(result.error));
                    }
                    if (JSON.parse(response).payload.data.someval == testvalue) {
                        done();
                    }
                });
            });
            req.on("error", function (e) {
                console.error("problem with request: " + e.message);
            });
            req.write(postData);
            req.end();
        });
        /************************************   States   ****************************************/
        mocha_1.it("/api/v3/states", function (done) {
            var postData = JSON.stringify({ id: testAccount.testDev });
            var options = {
                hostname: "localhost",
                port: testAccount.port,
                path: "/api/v3/states",
                method: "GET",
                headers: {
                    Authorization: "Basic " + Buffer.from("api:key-" + testAccount.apikey).toString("base64"),
                    "Content-Type": "application/json"
                }
            };
            // CREATE REQUEST OBJECT
            var req = http.request(options, function (res) {
                var response = "";
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    response += chunk;
                });
                res.on("end", function () {
                    var result = JSON.parse(response);
                    if (result.error) {
                        done(new Error(result.error));
                    }
                    for (var d in result) {
                        if (result[d].id == "testDeviceDEV") {
                            if (result[d].data.someval == testvalue) {
                                done();
                            }
                        }
                    }
                });
            });
            req.on("error", function (e) {
                console.error("problem with request: " + e.message);
            });
            req.end();
        });
        /************************************   Delete   ****************************************/
        mocha_1.it("/api/v3/state/delete", function (done) {
            var postData = JSON.stringify({ id: testAccount.testDev });
            var options = {
                hostname: "localhost",
                port: testAccount.port,
                path: "/api/v3/state/delete",
                method: "POST",
                headers: {
                    Authorization: "Basic " + Buffer.from("api:key-" + testAccount.apikey).toString("base64"),
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(postData)
                }
            };
            // CREATE REQUEST OBJECT
            var req = http.request(options, function (res) {
                var response = "";
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    response += chunk;
                });
                res.on("end", function () {
                    var result = JSON.parse(response);
                    if (result.error) {
                        done(new Error(result.error));
                    }
                    else {
                        done();
                    }
                });
            });
            req.on("error", function (e) {
                console.error("problem with request: " + e.message);
            });
            req.write(postData);
            req.end();
        });
    });
    mocha_1.describe("MQTT+SOCKETS+REST API", function () {
        /************************************   MQTT+SOCKETS+REST API   ****************************************/
        mocha_1.it("/api/v3/data/post + SOCKETS + MQTT", function (done) {
            this.timeout(6000);
            var mqtt = require('mqtt');
            var client = mqtt.connect('mqtt://localhost', { username: "api", password: "key-" + testAccount.apikey });
            var randomnumber = Math.round(Math.random() * 10000);
            var socket = require("socket.io-client")(testAccount.server + ":" + testAccount.port);
            var counter = 0;
            var mqttpacket;
            var socketpacket;
            var originalData;
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
                        }
                        else {
                            done(new Error("Original Data sent and Socket packets recieved not the same!"));
                        }
                    }
                    else {
                        done(new Error("Original Data sent and Mqtt packets recieved not the same!"));
                    }
                }
                else {
                    done(new Error("Mqtt and Socket packets recieved not the same!"));
                }
            }
            /*************************** Socket Connect *************************************/
            socket.on("connect", function () {
                socket.emit("join", testAccount.apikey);
                /*************************** MQTT Connect *************************************/
                client.on('connect', function () {
                    var dataVar = { random: randomnumber, temp: { cold: Math.round(Math.random() * 10000), hot: Math.round(Math.random() * 10000) }, gps: { lat: 25.566, lon: -25.39955 } };
                    /*************************** Http POST *************************************/
                    trex.restJSON({
                        apikey: testAccount.apikey,
                        method: "POST",
                        path: testAccount.server + "/api/v3/data/post",
                        body: { id: testAccount.testDev, data: dataVar },
                        port: testAccount.port
                    }, function (err, result) {
                        if (err) {
                            done(err);
                        }
                    });
                    originalData = JSON.stringify(dataVar);
                    client.subscribe(testAccount.apikey, function (err) {
                        if (err) {
                            done(err);
                        }
                    });
                    client.on('message', function (topic, message) {
                        //console.log(message+"-------mqtt")
                        var t = JSON.parse(message.toString());
                        mqttpacket = JSON.stringify(t.data);
                        //console.log(mqttpacket+"---------------mqtt1")
                        counter++;
                        checkSuccess();
                    });
                });
            });
            socket.on("post", function (data) {
                //console.log(JSON.stringify(data)+"-------------------socket")
                socketpacket = JSON.stringify(data.data);
                counter++;
                checkSuccess();
            });
        });
        /************************************   MQTT+SOCKETS+REST API   ****************************************/
        mocha_1.it("MQTT + /api/v3/data/post + SOCKETS", function (done) {
            this.timeout(6000);
            var mqtt = require('mqtt');
            var client = mqtt.connect('mqtt://localhost', { username: "api", password: "key-" + testAccount.apikey });
            var socket = require("socket.io-client")(testAccount.server + ":" + testAccount.port);
            var randomnumber = Math.round(Math.random() * 10000);
            var dataVar = { random: randomnumber, asdf: "123" };
            var counter = 0;
            var restpacket;
            var socketpacket;
            var originalData;
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
                        }
                        else {
                            done(new Error("Original Data sent and Socket packets recieved not the same!"));
                        }
                    }
                    else {
                        done(new Error("Original Data sent and Mqtt packets recieved not the same!"));
                    }
                }
                else {
                    done(new Error("Mqtt and Socket packets recieved not the same!"));
                }
            }
            socket.on("connect", function () {
                socket.emit("join", testAccount.apikey);
                /*************************** MQTT Connect *************************************/
                client.on('connect', function () {
                    client.subscribe(testAccount.apikey, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            var testdevice = { id: "MQTTTESTDEV", data: dataVar };
                            client.publish(testAccount.apikey, JSON.stringify(testdevice));
                            originalData = JSON.stringify(dataVar);
                            trex.restJSON({
                                apikey: testAccount.apikey,
                                method: "POST",
                                path: testAccount.server + "/api/v3/view",
                                body: testdevice,
                                port: testAccount.port
                            }, function (err, result) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    restpacket = JSON.stringify(result.data);
                                    // console.log(restpacket+"-----------Rest1")
                                    counter++;
                                }
                            });
                        }
                    });
                });
            });
            socket.on("post", function (data) {
                socketpacket = JSON.stringify(data.data);
                counter++;
                checkSuccess();
            });
        });
        /************************************   MQTT+SOCKETS+REST API   ****************************************/
        mocha_1.it("SOCKETS  +  MQTT + /api/v3/data/post", function (done) {
            this.timeout(6000);
            var mqtt = require('mqtt');
            var client = mqtt.connect('mqtt://localhost', { username: "api", password: "key-" + testAccount.apikey });
            var socket = require("socket.io-client")("http://localhost:8080");
            var randomnumber = Math.round(Math.random() * 10000);
            var dataVar = {
                random: randomnumber,
                temp: { cold: 1, hot: 0 },
                gps: { lat: 25.566, lon: -25.39955 }
            };
            var counter = 0;
            var restpacket;
            var mqttpacket;
            var socketpacket;
            var originalData;
            socket.on("connect", function () {
                socket.emit("join", testAccount.apikey);
                /*************************** MQTT Connect *************************************/
                client.on('connect', function () {
                    client.subscribe(testAccount.apikey, function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    socket.emit("post", { id: testAccount.testDev, data: dataVar });
                    originalData = JSON.stringify(dataVar);
                    //console.log(originalData+"---------------------original data sent")
                });
                client.on('message', function (topic, message) {
                    var t = JSON.parse(message.toString());
                    mqttpacket = JSON.stringify(t.data);
                    //console.log(message+"--------------------------mqtt")
                    counter++;
                    checkSuccess();
                });
            });
            socket.on("post", function (data) {
                var testDevice = { id: testAccount.testDev };
                trex.restJSON({
                    apikey: testAccount.apikey,
                    method: "POST",
                    path: testAccount.server + "/api/v3/view",
                    body: testDevice,
                    port: testAccount.port
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        restpacket = JSON.stringify(result.data);
                        //console.log(JSON.stringify(result)+"----------------------------rest")
                        counter++;
                        checkSuccess();
                    }
                });
                socketpacket = JSON.stringify(data.data);
                //console.log(socketpacket+"--------------------------socket")
                counter++;
                checkSuccess();
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
                            }
                            else {
                                done(new Error("Original Data sent and MQTT packets recieved not the same!"));
                            }
                        }
                        else {
                            done(new Error("Original Data sent and Socket packets recieved not the same!"));
                        }
                    }
                    else {
                        done(new Error("Original Data sent and Rest packets recieved not the same!"));
                    }
                }
                else {
                    done(new Error("Rest and Socket packets recieved not the same!"));
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
function generateDifficult(count) {
    var _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    var str = '';
    for (var i = 0; i < count; i++) {
        var tmp = _sym[Math.round(Math.random() * (_sym.length - 1))];
        str += "" + tmp;
    }
    return str;
}
