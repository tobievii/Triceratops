import { log } from "./utils"
log("MAIN \tStart ===============================")
require('source-map-support').install();
var nodemailer = require("nodemailer")
var _ = require('lodash');
var randomString = require('random-string');
import * as fs from 'fs';
import * as geoip from 'geoip-lite'
const publicIp = require('public-ip');

import * as scrypt from "scrypt"

//var scrypt = require("scrypt");
//var config = JSON.parse(fs.readFileSync('../config.json').toString());

import { configGen } from "./config"

import * as trex from './utils'
import * as state from "./state"
//import * as discordBot from './discordBot'


let config: any = configGen();
var version = config.version; //
//trex.log(config);

var compression = require('compression')

import express = require('express');

var sprintf = require("sprintf-js").sprintf;

const app = express()
var http = require('http');
var https = require('https');
var cookieParser = require('cookie-parser')
import * as accounts from './accounts'

import * as events from "events";

import * as utilsLib from "./utils"

var mongojs = require('mongojs')

const { VM } = require('vm2');

var db = mongojs(config.mongoConnection, config.mongoCollections);

var eventHub = new events.EventEmitter();
import { plugins } from "./plugins/config"
import * as stats from "./stats"

app.disable('x-powered-by');
app.use(cookieParser());
app.use(compression());

app.use(express.static('../public'))
app.use(express.static('../client'))
app.use(express.static('../client/dist'))

app.use('/view', express.static('../client/dist'))
app.use('/u/:username/view', express.static('../client/dist'))





//####################################################################
// PLUGINS

eventHub.on("device", (data: any) => {
  //log("----")



  handleDeviceUpdate(data.apikey, data.packet, { socketio: true }, (e: Error, r: any) => { });
})
eventHub.on("plugin", (data: any) => {
  io.sockets.emit('plugin', data);
})

//app.use(express.json())
app.use(safeParser);

//FIRST RUN
// OLD: accounts.defaultAdminAccount(db);
utilsLib.checkFirstRun(db);

utilsLib.createUsernamesForOldAccounts(db);
utilsLib.createDeviceKeysForOldAccounts(db);

//handle accounts/cookies.
app.use(accounts.midware(db));



db.on('connect', function () {

  for (var p in plugins) {
    if (plugins[p].init) {
      log("PLUGIN\tinit [" + plugins[p].name + "]")
      plugins[p].init(app, db, eventHub);
    }
  }

})

//####################################################################
// USERS LAST SEEN / ACTIVE
app.use((req: any, res: any, next: any) => {

  if (req.user) {

    if (req.user.level == 0) {
      log("USER\tunregistered" + "\t" + req.url)
    }


    db.users.findOne({ apikey: req.user.apikey }, (e: Error, user: any) => {
      user["_last_seen"] = new Date();
      db.users.update({ apikey: req.user.apikey }, user, (e2: Error, r2: any) => {
        next();
      })
    })
  } else {
    next();
  }

})

//####################################################################

app.get('/', (req: any, res: any) => {

  //redirect main page people to https.
  if (req.protocol == "http") {
    trex.log("HTTP VISITOR")
    if (config.ssl) {
      res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
      res.end();
    }
  }

  if (req.user) {
    if (req.user.level > 0) {
      fs.readFile('../public/react.html', (err: Error, data: any) => {
        res.end(data.toString())
      })
    } else {
      fs.readFile('../public/react.html', (err: Error, data: any) => {
        res.end(data.toString())
      })
    }
  } else {
    res.end("AN ERROR HAS OCCURED. ARE COOKIES ENABLED?")
  }

})

stats.init(app, db);

app.get('/admin/accounts', (req: any, res: any) => {
  fs.readFile('../public/admin_accounts.html', (err: Error, data: any) => {
    res.end(data.toString())
  })
})

app.get("/recover/:recoverToken", (req: any, res: any) => {
  fs.readFile('../public/react.html', (err: Error, data: any) => {
    res.end(data.toString())
  })
})

app.get("/accounts/secure", (req: any, res: any) => {
  fs.readFile('../public/react.html', (err: Error, data: any) => {
    res.end(data.toString())
  })
})

app.get('/signout', (req: any, res: any) => {
  res.clearCookie("uuid");
  res.redirect('/');
});

app.post('/signin', accounts.signInFromWeb(db));

app.get("/u/:username", (req: any, res: any) => {
  fs.readFile('../public/react.html', (err: Error, data: any) => {
    res.end(data.toString())
  })
})

const webpush = require("web-push");

const publicVapidKey =
  "BNOtJNzlbDVQ0UBe8jsD676zfnmUTFiBwC8vj5XblDSIBqnNrCdBmwv6T-EMzcdbe8Di56hbZ_1Z5s6uazRuAzA";
const privateVapidKey = "IclWedYTzNBuMaDHjCjA1B5km-Y3NAxTGbxR7BqhU90";

webpush.setVapidDetails(
  "mailto:DeepaSoul.sa@gmail.com",
  publicVapidKey,
  privateVapidKey
);

app.post("/subscribe", (req: any, res: any) => {
  // Get pushSubscription object
  const subscription = req.body;
  // Send 201 - resource created
  res.status(201).json({});

  // Create payload
  const payload = JSON.stringify({ title: "Push Test" });

  // Pass object into sendNotification
  webpush
    .sendNotification(subscription, payload)
    .then((response: any) => {
      // io.to(req.user.apikey).emit('pushNotification', { title: "Push Test" })
    })
    .catch((err: any) => console.error(err));
});

app.get("/u/:username/view/:devid", (req: any, res: any) => {
  fs.readFile('../public/react.html', (err: Error, data: any) => {
    res.end(data.toString())
  })
})

app.get("/notifications", (req: any, res: any) => {
  fs.readFile('../public/react.html', (err: Error, data: any) => {
    res.end(data.toString())
  })
})


app.get('/settings', (req: any, res: any) => {
  fs.readFile('../public/react.html', (err: Error, data: any) => {
    res.end(data.toString())
  })
});

app.get('/view/:id', (req: express.Request | any, res: express.Response | any) => {
  trex.log("client is viewing: " + JSON.stringify(req.params));
  fs.readFile('../public/react.html', (err: Error, data: any) => {
    res.end(data.toString())
  })
})

app.get('/view/:id/:mode', (req: express.Request | any, res: express.Response | any) => {
  trex.log("client is viewing: " + JSON.stringify(req.params));
  fs.readFile('../public/react.html', (err: Error, data: any) => {
    res.end(data.toString())
  })
})

app.get('/fbp', (req: express.Request | any, res: express.Response | any) => {
  trex.log("fbp:");
  fs.readFile('../public/react.html', (err: Error, data: any) => {
    res.end(data.toString())
  })
})

app.get('/api/v3/version', (req: any, res: any) => {
  res.json(version);
})

app.get('/api/v3/account', (req: any, res: any) => {
  var cleanUser = _.clone(req.user);

  delete cleanUser.password;
  res.json(cleanUser);
})

app.get('/api/v3/account/stats', (req: any, res: any) => {
  stats.accountStats(req.user, (err: Error, stats: any) => {
    if (err) { res.json(err); }
    res.json(stats)
  })
})


// This is to update the workflow on a device.
app.post("/api/v3/workflow", (req: any, res: any) => {
  if (req.body) {
    trex.log("WORKFLOW UPDATE");

    state.updateWorkflow(db, req.user.apikey, req.body.id, req.body.code, (err: Error, result: any) => {
      if (err) res.json(err);
      if (result) res.json(result);
    })

  } else {
    trex.log("WORKFLOW API ERROR")
  }
})

app.post("/api/v3/packets", (req: any, res: any, next: any) => {
  if (!req.user) { res.json({ error: "user not authenticated" }); return; }

  var resolved = false;



  // find history by key
  if (req.body.key) {
    resolved = true;
    db.states.findOne({ key: req.body.key }, (e: Error, device: any) => {
      if (req.body.datapath) {
        var query: any = { apikey: device.apikey, devid: device.devid }
        query["payload." + req.body.datapath] = { $exists: true }
        var result: any = []
        db.packets.find(query).sort({ "_id": -1 }).limit(50, (packetError: Error, rawpackets: any) => {
          if (packetError) { res.json(packetError); console.log(packetError); }

          var packets: any = []

          for (var p in rawpackets) {
            var found = 0;
            for (var o in packets) {
              if (rawpackets[p]["_created_on"] == packets[o]["_created_on"]) {
                found++;
              }
            }
            if (found == 0) { packets.push(rawpackets[p]) }
          }

          for (var pa of packets) {
            var clean: any = {}
            //clean[req.body.datapath] = _.get(p, "payload." + req.body.datapath, "notfound");
            //clean["_created_on"] = p["_created_on"]
            clean["x"] = pa["_created_on"]
            clean["y"] = _.get(pa, "payload." + req.body.datapath, "notfound");
            result.push(clean)
          }
          res.json(result);
        })
      }
    })
  }

  ////////////////////////////////
  var limit = 25;
  if (req.body.limit) { limit = req.body.limit }
  if (req.body.id) {
    resolved = true;
    db.packets.find({ apikey: req.user.apikey, devid: req.body.id }).sort({ _id: -1 }).limit(limit, (err: Error, rawpackets: any) => {
      rawpackets = rawpackets.reverse();
      var packets = []

      for (var p in rawpackets) {
        //packets.push({data: rawpackets[p].payload.data, timestamp: rawpackets[p].payload.timestamp})
        var payload = rawpackets[p].payload;
        payload.meta = { userAgent: rawpackets[p].meta.userAgent, method: rawpackets[p].meta.method }
        packets.push(payload)
      }
      res.json(packets);
    })
  }
  if (resolved == false) {
    res.json({ error: "We require either an id or device key for this query" })
  }
});

app.post("/api/v3/devicePathPackets", (req: any, res: any, next: any) => {

  if (!req.user) { res.json({ error: "user not authenticated" }); return; }

  var limit = 25;
  if (req.body.limit) { limit = req.body.limit }

  if (req.body.id) {
    db.packets.find({ apikey: req.user.apikey, devid: req.body.id }).sort({ _id: -1 }).limit(limit, (err: Error, rawpackets: any) => {
      // db.packets.find({ apikey: req.user.apikey, devid: req.body.id }).sort({ _id: -1 }).limit(limit, (err: Error, rawpackets: any) => {
      rawpackets = rawpackets.reverse();
      var packets = []
      var latlng = {
        ll:
          [
            0.01,
            0.01
          ]
      }

      for (var p in rawpackets) {
        var payload = rawpackets[p];
        var devicepacket: any;
        var t = {
          id: payload.payload.id,
          timestamp: payload.payload.timestamp
        }
        devicepacket = t;

        if (payload.payload.data.gps != undefined || payload.payload.data.gps != null) {
          devicepacket.data = payload.payload.data;
        } else if (payload.meta.ipLoc != undefined || payload.meta.ipLoc != null) {
          if (payload.meta.ipLoc.ll == undefined || payload.meta.ipLoc == null) {
            payload.meta.ipLoc = latlng;
          }
          devicepacket.ipLoc = payload.meta.ipLoc;
        } else {
          if (payload.meta.ipLoc == undefined || payload.meta.ipLoc == null) {
            payload.meta.ipLoc = latlng;
            devicepacket.ipLoc = payload.meta.ipLoc;
          }
        }
        packets.push(devicepacket)
      }
      res.json(packets);
    })
  } else {
    res.json({ error: "No id parameter provided to filter states by id. Use GET /api/v3/states instead for all states data." })
  }
});

// run to update old packet data to have correct timestamp
// app.get("/admin/processpackets", (req:any, res:any)=>{
//   if (req.user.level < 100) { res.end("no permission"); return; }
//   db.packets.find({"_created_on" : { "$exists" : false }}).limit(10000, (err:Error, packets:any)=>{
//     res.write("packets:\t"+packets.length);
//     for (var packet of packets) {
//       if (packet["_created_on"] == undefined) {
//         packet["_created_on"] = new Date(packet.meta.created.jsonTime);
//         db.packets.update({"_id" : packet["_id"]}, packet)
//       }      
//     }
//     res.end("\ndone.")
//   })
// })

// run to update old packet data to have correct timestamp
app.get("/admin/processusers", (req: any, res: any) => {
  if (req.user.level < 100) { res.end("no permission"); return; }

  db.users.find({ "_created_on": { "$exists": false } }).limit(10000, (err: Error, users: any) => {
    res.write("users:\t" + users.length);
    for (var user of users) {
      if (user["_created_on"] == undefined) {
        user["_created_on"] = new Date(user.created.jsonTime);
        db.users.update({ "_id": user["_id"] }, user)
      }
    }
    res.end("\ndone.")
  })
})

app.post("/api/v3/account/secure", (req: any, res: any, next: any) => {
  var scryptParameters = scrypt.paramsSync(0.1);

  db.users.find({ encrypted: { $exists: false } }, (err: Error, result: any) => {
    for (var i in result) {
      var newpass = scrypt.kdfSync(result[i].password, scryptParameters);
      db.users.update({ email: result[i].email }, { $set: { password: newpass, encrypted: true } })
    }
  })
});

app.get("/admin/processusersseen", (req: any, res: any) => {
  if (req.user.level < 100) { res.end("no permission"); return; }

  db.users.find({ "_last_seen": { "$exists": false } }).limit(10000, (err: Error, users: any) => {
    res.write("users:\t" + users.length);
    for (var user of users) {
      if (user["_last_seen"] == undefined) {
        user["_last_seen"] = new Date(user.created.jsonTime);
        db.users.update({ "_id": user["_id"] }, user)
      }
    }
    res.end("\ndone.")
  })
})

app.get("/admin/processstates", (req: any, res: any) => {
  if (req.user.level < 100) { res.end("no permission"); return; }

  db.states.find({ "_last_seen": { "$exists": false } }).limit(10000, (err: Error, states: any) => {
    res.write("states:\t" + states.length);
    for (var state of states) {

      if (state["_last_seen"] == undefined) {
        state["_last_seen"] = new Date(state.meta.created.jsonTime);
      }
      if (state["_created_on"] == undefined) {
        state["_created_on"] = new Date(state.meta.created.jsonTime);
      }

      db.states.update({ "_id": state["_id"] }, state)
    }
    res.end("\ndone.")
  })
})

app.post("/api/v3/view", (req: any, res: any, next: any) => {
  if (!req.user) { res.json({ error: "user not authenticated" }); return; }


  if (req.body.username) {
    //

    if (req.body.username != req.user.username) {
      if (req.user.level < 100) {
        db.states.findOne({ devid: req.body.id }, { key: 1 }, (err: Error, give: any) => {
          db.users.findOne({ $and: [{ username: req.user.username }, { 'shared.keys.key': give.key }] }, (err: Error, found: any) => {
            if (found == null) {
              res.json({ error: "must be level 100" }); return
            }
          })
        })
      }
    }
    db.users.findOne({ username: req.body.username }, (dbError: Error, user: any) => {
      if (user) {
        ///
        if (req.body.id) {
          db.states.findOne({ $and: [{ apikey: user.apikey, devid: req.body.id }] }, (err: Error, state: any) => {
            if (state == null || state == "" || state == undefined || state.length == 0) { res.json({ "error": "id not found" }); return; }

            if (state) {
              var viewState = state.payload;
              viewState.meta = { userAgent: state.meta.userAgent, method: state.meta.method }
              res.json(viewState);
            } else {
              res.json({ error: "state not found" })
            }
          })
        } else {
          res.json({ error: "No id parameter provided to filter states by id. Use GET /api/v3/states instead for all states data." })
        }
        ///
      }
    });
    //
  } else {
    if (req.body.id) {
      db.states.findOne({ apikey: req.user.apikey, devid: req.body.id }, (err: Error, state: any) => {

        if (state == null) { res.json({ "error": "id not found" }); return; }

        if (state) {
          var viewState = state.payload;
          viewState.meta = { userAgent: state.meta.userAgent, method: state.meta.method }
          res.json(viewState);
        } else {
          res.json({ error: "state not found" })
        }


      })
    } else {
      res.json({ error: "No id parameter provided to filter states by id. Use GET /api/v3/states instead for all states data." })
    }
  }

});

app.post("/api/v3/state", (req: any, res: any) => {
  findstate(req, res);
});

async function findstate(req: any, res: any) {
  if (req.body.username) {

    if (req.body.username != req.user.username) {
      if (req.user.level < 100) {
        await db.states.findOne({ devid: req.body.id }, (err: Error, give: any) => {
          db.users.findOne({ $and: [{ username: req.user.username }, { 'shared.keys.key': give.key }] }, (err: Error, found: any) => {
            if (give.public == false || give.public == null || give.public == undefined || !give.public || give.public == "") {
              if (found == null) {
                res.json({ error: "must be level 100" }); return;
              }
            }
          })
        });
      }
    }

    await db.users.findOne({ username: req.body.username }, (dbError: Error, user: any) => {
      if (user) {
        if (req.body.id) {
          db.states.findOne({ $and: [{ apikey: user.apikey, devid: req.body.id }] }, (err: Error, state: any) => {
            res.json(state);
          })
        } else {
          res.json({ error: "No id parameter provided to filter states by id. Use GET /api/v3/states instead for all states data." })
        }
      }
    })
  } else {

    if (!req.user) { res.json({ error: "user not authenticated" }); return; }

    if (req.body.id) {
      db.states.findOne({ apikey: req.user.apikey, devid: req.body.id }, (err: Error, state: any) => {
        res.json(state);
      })
    } else {
      res.json({ error: "No id parameter provided to filter states by id. Use GET /api/v3/states instead for all states data." })
    }
  }
}

app.post('/api/v3/publicStates', (req: any, res: any) => {
  if (req.user.level == 0) {
    db.states.find({ public: true }, (err: Error, result: any) => {
      res.json(result);
    })
  }
})

app.post('/api/v3/makedevPublic', (req: any, res: any) => {

  db.states.update({ key: req.body.devid }, { $set: { public: true } }, (err: Error, result: any) => {
    res.json(result);
  })
})

app.post('/api/v3/makedevPrivate', (req: any, res: any) => {

  db.states.update({ key: req.body.devid }, { $set: { public: false } }, (err: Error, result: any) => {
    res.json(result);
  })
})

app.get('/api/v3/states', (req: any, res: any) => {
  if (!req.user) { res.json({ error: "user not authenticated" }); return; }

  db.states.find({ apikey: req.user.apikey }, (err: Error, states: any[]) => {
    var cleanStates = []
    for (var a in states) { cleanStates.push(states[a].payload) }
    res.json(cleanStates);
  })
})

//Share Device
app.post('/api/v3/shared', (req: any, res: any) => {
  if (!req.user) { res.json({ error: "user not authenticated" }); return; }
  db.states.findOne({ apikey: req.user.apikey, devid: req.body.dev }, { access: 1, _id: 0 }, (err: Error, states: any) => {
    if (states.access) {
      res.json(states)
    } else {
      res.json({ result: "No Devices" })
    }
  })
})
//Share Device

//unshare Device
app.post('/api/v3/unshare', (req: any, res: any) => {
  if (!req.user) { res.json({ error: "user not authenticated" }); return; }
  db.states.findOne({ $and: [{ devid: req.body.dev }, { apikey: req.user.apikey }] }, { _id: 0, key: 1 }, (err: Error, result: any) => {
    db.users.update({ uuid: req.body.removeuser }, { "$pull": { shared: { keys: { key: result.key } } } })
  })
  //remove device from user


  db.states.update({ apikey: req.user.apikey, devid: req.body.dev }, { $pull: { access: { $in: [req.body.removeuser] } } }, (err: Error, states: any) => {
    res.json(states)
  })
})
//unshare device

//preview devices
app.post('/api/v3/preview/publicdevices', (req: any, res: any) => {
  db.states.find({}, { devid: 1 }, (err: Error, states: any) => {
    res.json(states)
  })
})
//preview devices

// new in 5.0.34:
app.post("/api/v3/states", (req: any, res: any, packet: any) => {
  checkExsisting(req, res)

  if (req.body) {
    // find state by username
    if (req.body.username != req.user.username) {
      if (req.user.level < 100) {
        db.users.findOne({ username: req.body.username }, { apikey: 1, _id: 0 }, (err: Error, sharedwith: any) => {
          db.states.find({ $and: [{ apikey: sharedwith.apikey }, { 'access': req.user.uuid }] }, (err: Error, known: any) => {
            if (known == null || known.length == 0) {
              res.json([])
              return;
            }
          })
        })

      }
      else if (req.user.level) {
        db.users.findOne({ username: req.body.username }, (e: Error, user: any) => {
          if (e) { res.json({ error: "db error" }) }
          if (user) {
            db.states.find({ apikey: user.apikey }, (er: Error, states: any[]) => {
              var cleanStates: any = []
              for (var a in states) {
                var cleanState = _.clone(states[a])
                delete cleanState["apikey"]
                cleanStates.push(cleanState);
              }
              res.json(cleanStates)
            })
          }
        })
      }
    }

    // todo filter by permission/level
    if (req.body.username != req.user.username) {
      if (req.user.level < 100) {
        if (req.body.username) {
          db.users.findOne({ username: req.body.username }, (e: Error, user: any) => {
            if (e) { res.json({ error: "db error" }) }
            if (user) {
              db.states.find({ $or: [{ $and: [{ apikey: user.apikey }, { 'access': req.user.uuid }] }, { public: true }] }, (er: Error, states: any[]) => {
                var cleanStates: any = []
                for (var a in states) {
                  var cleanState = _.clone(states[a])
                  delete cleanState["apikey"]
                  cleanStates.push(cleanState);
                }
                res.json(cleanStates)
              })
            }
          })
        }
      }
    }
    else {
      if (req.body.username) {
        db.users.findOne({ username: req.body.username }, (e: Error, user: any) => {
          if (e) { res.json({ error: "db error" }) }
          if (user) {
            db.states.find({ apikey: user.apikey }, (er: Error, states: any[]) => {
              var cleanStates: any = []
              for (var a in states) {
                var cleanState = _.clone(states[a])
                delete cleanState["apikey"]
                cleanStates.push(cleanState);
              }
              res.json(cleanStates)
            })
          }
        })
      }
    }
  }
})

app.get("/api/v3/states/full", (req: any, res: any) => {
  db.states.find({ apikey: req.user.apikey }, (err: Error, states: any[]) => {
    res.json(states);
  })
})

app.get("/api/v3/states/usernameToDevice", (req: any, res: any) => {
  if (req.user.level == 100) {
    db.states.aggregate([{
      $lookup: { from: "users", localField: "meta.user.email", foreignField: "email", as: "fromUsers" }
    },
    { $unwind: '$fromUsers' }, { $match: { apikey: req.user.apikey } },
    ], (err: Error, result: any) => {
      res.json(result)
    })
  }
  else if (req.user.level == 0) {
    db.states.aggregate([{
      $lookup: { from: "users", localField: "meta.user.email", foreignField: "email", as: "fromUsers" }
    },
    { $unwind: '$fromUsers' }, { $match: { public: true } },
    ], (err: Error, result: any) => {
      res.json(result)
    })
  }
})

app.post("/api/v3/dashboard", (req: any, res: any) => {

  db.states.findOne({ key: req.body.key }, (e: Error, dev: any) => {
    dev.layout = req.body.layout
    db.states.update({ key: req.body.key }, dev, (errorUpdating: Error, resultUpdating: any) => {
      res.json(resultUpdating);
    })
  })
}
)

app.post("/api/v3/selectedIcon", (req: any, res: any) => {
  db.states.findOne({ key: req.body.key }, (e: Error, dev: any) => {
    dev.selectedIcon = req.body.selectedIcon
    db.states.update({ key: req.body.key }, dev)
  })
})

app.post("/api/v3/boundaryLayer", (req: any, res: any) => {
  db.states.findOne({ key: req.body.key }, (e: Error, dev: any) => {
    dev.boundaryLayer = req.body.boundaryLayer

    io.to(req.body.key).emit('boundary', dev)
    var device = dev;
    delete device["_last_seen"]
    delete device["selectedIcon"]
    delete device["layout"]
    device.boundaryLayer["_created_on"] = new Date();
    db.packets.save(dev, (errSave: Error, resSave: any) => {

      dev["_last_seen"] = new Date();
      dev.payload["timestamp"] = new Date();
      db.states.update({ key: req.body.key }, dev)
      // update user account activity timestamp
      db.users.findOne({ apikey: req.user.apikey }, (e: Error, user: any) => {
        user["_last_seen"] = new Date();
        db.users.update({ apikey: user.apikey }, user, (e2: Error, r2: any) => {
          if (e2) {
            res.json(e2)
          } else if (r2) {
            res.json({ result: "Successfully Added Boundary" })
          }
        })
      })
    })
  })
})

app.post('/api/v3/accounts/create', (req: any, res: any) => {
  if (req.user.level < 100) { res.json({ error: "permission denied" }); return; }

  if (req.body) {
    if (req.body.email) {
      accounts.accountCreate(db, req.body.email, req.get('User-Agent'), req.ip, (err: Error, user: any) => {
        if (err) res.json({ error: err.toString() });
        if (user) res.json(user)
      }, req.body);
    }
  }
})

app.post('/api/v3/account/update', (req: any, res: any) => {
  db.users.update({ apikey: req.user.apikey }, { "$set": req.body }, (err: Error, result: any) => {
    if (err) res.json({ error: err.toString() });
    if (result) res.json(result);
  })
})

function safeParser(req: any, res: any, next: any) {
  var buf = ""
  req.on("data", (chunk: any) => { buf += chunk.toString(); })
  req.on("end", () => {
    if (buf.length > 0) {
      try {
        var jsonin = JSON.parse(buf)
        req.body = jsonin;
        next();
      } catch (err) {
        res.status(400).json({ "error:": err.toString() + ". Make sure you are sending valid JSON" })
        next();
      }
    } else { next(); }
  })
}

function addRawBody(req: any, res: any, buf: any, encoding: any) {
  req.rawBody = buf.toString();
}

///////// END

app.get("/api/v3/getlocation", (req: any, res: any) => {
  //console.log("-------")
  //console.log(req.ip)
  var geoIPLoc = geoip.lookup(req.ip);
  // console.log(geoIPLoc)
  res.json(geoIPLoc)
});

app.put("/api/v3/data/put", (req: any, res: any, next: any) => {
  handleState(req, res, next);
});

app.post("/api/v3/data/post", (req: any, res: any, next: any) => {
  handleState(req, res, next);
});

app.post("/api/v3/sort", (req: any, res: any) => {
  db.users.update({ apikey: req.user.apikey }, { $set: { sort: req.body.sort } }, (err: Error, response: any) => {
    if (err) res.json(err);
    if (response) res.json({ result: "added sort" });
  })
});

app.get("/api/v3/getsort", (req: any, res: any) => {
  db.users.findOne({ apikey: req.user.apikey }, (err: Error, response: any) => {
    if (err) res.json(err);
    if (response) res.json({ sort: response.sort });
  })
});

function checkExsisting(req: any, res: any) {
  db.users.findOne({ apikey: req.user.apikey }, (err: Error, state: any, info: any) => {

    function findNotified(array: any) {
      var t = [];
      for (var i = 0; i < array.length; i++) {
        if (array[i].notified == undefined || array[i].notified == null) {

          array[i].notified = false;

          io.to(req.user.username).emit("info", info)

          db.users.update({ apikey: req.user.apikey }, { $set: { notifications: t } }, (err: Error, updated: any) => {
            io.to(req.user).emit("notification")
            if (err) res.json(err);
            if (updated) res.json(updated);
          })
        }
        t.push(array[i]);
      }
    }

    function findSeen(array: any) {
      var t = [];
      for (var i = 0; i < array.length; i++) {
        if (array[i].seen == undefined || array[i].seen == null) {

          array[i].seen = false;

          io.to(req.user.username).emit("info", info)

          db.users.update({ apikey: req.user.apikey }, { $set: { notifications: t } }, (err: Error, updated: any) => {
            io.to(req.user).emit("notification")
            if (err) res.json(err);
            if (updated) res.json(updated);
          })
        }
        t.push(array[i]);
      }
    }

    findNotified(state.notifications);
    findSeen(state.notifications);
  })
}

setInterval(() => {
  //getWarningNotification();     //disable till we find out cause of lag
}, 600000)

function getWarningNotification() {

  var now: any = new Date();
  var dayago = new Date(now - (1000 * 60 * 60 * 24));
  db.states.find({ "_last_seen": { $lte: dayago }, notification24: { $exists: false } }, (e: Error, listDevices: any) => {

    for (var s in listDevices) {
      var device = listDevices[s]
      db.states.update({ key: device.key }, { $set: { notification24: true } }, (err: any, result: any) => {

        var WarningNotificationL = {
          type: "CONNECTION DOWN 24HR WARNING",
          device: device.devid,
          created: new Date(),
          notified: true,
          seen: false
        };

        db.users.update({ apikey: device.apikey }, { $push: { notifications: WarningNotificationL } }, (err: Error, updated: any) => {
          io.to(device.apikey).emit('pushNotification', WarningNotificationL)
        })
      })
    }
  })

}

function handleState(req: any, res: any, next: any) {
  if (req.body === undefined) { return; }

  if ((req.user) && (req.user.level) > 0) {
    if (req.body.id == "") { res.json({ "error": "id may not be empty" }) }

    if (!req.body.id) { res.json({ "error": "id parameter missing" }); return; }

    if (typeof req.body.id != "string") {
      res.json({ "error": "id must be a string" })
    }
    if (req.body.id.indexOf(" ") != -1) {
      res.json({ "error": "id may not contain spaces" })
    }

    if (req.body.id.match(/^[a-z0-9_]+$/i) == null) {
      res.json({ "error": "id may only contain a-z A-Z 0-9 and _" });
    }

    if (typeof req.body.id != "string") { res.status(400).json({ "error": "parameter id must be of type string" }); return; }
    if (!req.body.data) { res.status(400).json({ "error": "data parameter missing" }); return; }
    if (req.body.id == null) { res.json({ "error": "id parameter null" }); return; }
    if (!req.body.data) { res.json({ "error": "data parameter missing" }); return; }

    var meta = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method
    }

    var hrstart = process.hrtime()

    processPacketWorkflow(db, req.user.apikey, req.body.id, req.body, plugins, (err: Error, newpacket: any) => {
      state.postState(db, req.user, newpacket, meta, (packet: any, info: any) => {

        db.states.findOne({ apikey: req.user.apikey, devid: req.body.id }, (Err: Error, Result: any) => {
          var message = "";
          var AlarmNotification = {
            type: "ALARM",
            device: req.body.id,
            created: Date.now(),
            message: message,
            notified: true,
            seen: false
          }

          if (Result.workflowCode != undefined) {
            if (Result.workflowCode.includes('notifications.alarm1(') && newpacket.err == undefined && newpacket.err == '') {
              AlarmNotification.message = Result.workflowCode.substring(
                Result.workflowCode.lastIndexOf('alarm1("') + 8,
                Result.workflowCode.lastIndexOf('")')
              )

              io.to(req.user.apikey).emit('pushNotification', AlarmNotification);
              io.to(req.user.apikey).emit("notification");

              if (req.user.notifications) {
                req.user.notifications.push(AlarmNotification)
              } else {
                req.user.notifications = [AlarmNotification]
              }
              db.users.findOne({ apikey: req.user.apikey }, (err: Error, result: any) => {

                for (var a of result.notifications) {
                  if (a = undefined || a.type !== 'ALARM' && a.device !== req.body.id) {
                    db.users.update({ apikey: req.user.apikey }, req.user, (err: Error, updated: any) => {
                      if (err !== null) {
                        console.log(err)
                      } else if (updated)
                        console.log(updated)
                    })
                  }
                }
              })
            }
          } else if (Result.boundaryLayer != undefined) {
            if (Result.boundaryLayer.inbound == false) {
              AlarmNotification.message = "has gone out of its boundary";
              io.to(req.user.apikey).emit('pushNotification', AlarmNotification);
              io.to(req.user.apikey).emit("notification");
              db.users.findOne({ apikey: req.user.apikey }, (err: Error, result: any) => {
                for (var a of result.notifications) {
                  if (a = undefined || a.type !== 'ALARM' && a.device !== req.body.id) {
                    db.users.update({ apikey: req.user.apikey }, req.user, (err: Error, updated: any) => {
                      if (err !== null) {
                        console.log(err)
                      } else if (updated)
                        console.log(updated)
                    })
                  }
                }
              })
            }
          }
        })

        io.to(req.user.apikey).emit('post', packet.payload);
        io.to(req.user.apikey + "|" + req.body.id).emit('post', packet.payload);
        io.to(packet.key).emit('post', packet.payload)

        db.states.findOne({ apikey: req.user.apikey, devid: req.body.id },
          (findErr: Error, findResult: any) => {
            if (findResult.notification24 == true) {
              db.states.update({ key: findResult.key }, { $unset: { notification24: 1 } }, (err: any, result: any) => {
                console.log(result)
                console.log(err)
              })
            }
          })

        if (info.newdevice) {

          var newDeviceNotification = {
            type: "NEW DEVICE ADDED",
            device: req.body.id,
            created: packet._created_on,
            notified: true,
            seen: false
          }

          io.to(req.user.username).emit("info", info)
          io.to(req.user.apikey).emit('pushNotification', newDeviceNotification)

          if (req.user.notifications) {
            req.user.notifications.push(newDeviceNotification)
          } else {
            req.user.notifications = [newDeviceNotification]
          }

          db.users.update({ apikey: req.user.apikey }, req.user, (err: Error, updated: any) => {
            io.to(req.user.apikey).emit("notification")
            if (err) res.json(err);
            if (updated) res.json(updated);
          })
        }

        for (var p in plugins) {
          if (plugins[p].handlePacket) {
            plugins[p].handlePacket(db, packet, (err: Error, packet: any) => {
            });
          }
        }

        res.json({ result: "success" });

        var hrend = process.hrtime(hrstart)

        log(sprintf('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000))
      })
    })
  } else {
    res.json({ "error": "user not authenticated" })
  }
}

/* ----------------------------------------------------------------------------- 
    DB QUERY
*/

function handleDeviceUpdate(apikey: string, packetIn: any, options: any, cb: any) {

  state.getUserByApikey(db, apikey, (err: any, user: any) => {
    if (err) { log(err); cb(err, undefined); return; }

    processPacketWorkflow(db, apikey, packetIn.id, packetIn, plugins, (err: Error, newpacket: any) => {
      state.postState(db, user, newpacket, packetIn.meta, (packet: any, info: any) => {
        if (options) {
          if (options.socketio == true) {
            io.to(apikey).emit('post', packet.payload);
            io.to(apikey + "|" + packetIn.id).emit('post', packet.payload);
            io.to(packet.key).emit('post', packet.payload)

            if (info.newdevice) {
              io.to(user.username).emit("info", info)
            }

          }
        }


        for (var p in plugins) {
          if (plugins[p].handlePacket) {
            plugins[p].handlePacket(db, packet, (err: Error, packet: any) => {

            });
          }
        }

        // iotnxtUpdateDevice(packet, (err:Error, result:any)=>{
        //   if (err) log("couldnt publish")
        // }); 

        cb(undefined, { result: "success" });

      })
    })

  })

}

app.get("/api/v3/state", (req: any, res: any, packet: any) => {

  db.states.find({ "payload.id": req.body.id }, (err: Error, state: any) => {
    res.json(state);
  })
});

app.get("/api/v3/u/notifications", (req: any, res: any) => {
  db.users.findOne({ apikey: req.user.apikey, notifications: req.user.notifications }, (err: Error, state: any) => {
    res.json(state.notifications);
  })
});

app.post("/api/v3/u/notifications/delete", (req: any, res: any) => {
  db.users.update({ apikey: req.user.apikey }, { $unset: { notifications: 1 } }, (err: Error, state: any) => {
    if (err != null) {
      console.log(err)
    } else if (state) {
      console.log(state)
    }
    res.json(state.notifications);
  })
});

app.post("/api/v3/state/delete", (req: any, res: any) => {
  if (req.body.username) {
    if (req.body.username != req.user.username) {
      if (req.user.level < 100) { res.json({ error: "must be level 100" }); return; }
    }

    db.users.findOne({ username: req.body.username }, (dbError: Error, user: any) => {
      if (user) {
        var meta = {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method
        }
        if (req.user.level < 100 && req.user.level > 0) {

          if (req.body.id) {
            db.states.remove({ apikey: user.apikey, devid: req.body.id }, (err: Error, removed: any) => {
              if (err) res.json(err);
              if (removed) res.json(removed);
            })
          } else {
            res.json({ result: "auth failed" });
          }
        }
        else if (req.user.level >= 100) {
          if (req.body.id) {
            db.states.remove({ key: req.body.key, devid: req.body.id }, (err: Error, removed: any) => {
              if (err) res.json(err);
              if (removed) res.json(removed);
            })
          } else {
            res.json({ result: "auth failed" });
          }
        }
      }
    })

  } else {
    if ((req.user) && (req.user.level) > 0) {
      if (!req.body.id) { res.json({ "error": "id parameter missing" }); return; }

      var meta = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method
      }
      if (req.user.level < 100 && req.user.level > 0) {
        if (req.body.id) {
          db.states.remove({ apikey: req.user.apikey, devid: req.body.id }, (err: Error, removed: any) => {
            if (err) res.json(err);
            if (removed) res.json(removed);
          })
        }
        else {
          res.json({ result: "auth failed" });
        }
      }
      else if (req.user.level >= 100) {
        if (req.body.id) {
          db.states.remove({ key: req.body.key, devid: req.body.id }, (err: Error, removed: any) => {
            if (err) res.json(err);
            if (removed) res.json(removed);
          })
        }
        else {
          res.json({ result: "auth failed" });
        }
      }
    }
  }
})

app.post("/api/v3/account/recoveraccount", (req: any, res: any) => {
  log("account registration")
  log(req.body)


  req.user.email = req.body.email
  accounts.Forgotpassword(db, req.user, (error: Error, result: any) => {
    res.json({ error, result, account: req.user })
  })

})



app.post("/api/v3/state/clear", (req: any, res: any) => {

  if (!req.user) { return; }
  if (req.user.level < 1) { return; }
  if (!req.body.id) { res.json({ "error": "id parameter missing" }); return; }



  db.states.update({ apikey: req.user.apikey, devid: req.body.id }, { "$set": { payload: { id: req.body.id, data: {} }, "meta.method": "clear", "meta.userAgent": "api" } }, (err: Error, cleared: any) => {
    if (err) res.json(err);
    if (cleared) res.json(cleared);
  })
}
)

app.post("/api/v3/state/deleteBoundary", (req: any, res: any) => {
  if (!req.user) { return; }
  if (req.user.level < 1) { return; }
  if (!req.body.id) { res.json({ "error": "id parameter missing" }); return; }

  db.states.update({ apikey: req.user.apikey, devid: req.body.id }, { $set: { 'boundaryLayer': undefined } }, (err: Error, cleared: any) => {
    if (err) res.json(err);
    if (cleared) {
      db.states.findOne({ apikey: req.user.apikey, devid: req.body.id }, (e: Error, dev: any) => {
        io.to(dev.key).emit('boundary', dev)
        res.json(cleared);
      })
    }
  })
})

app.post("/api/v3/allUsers", (req: any, res: any) => {
  db.users.find({
    $or: [{ 'username': { '$regex': req.body.search } }, { 'email': { '$regex': req.body.search } }],
    level: { $gte: 1 },
    "username": { "$exists": true },
    "$expr": { "$ne": [{ "$strLenCP": "$username" }, 32] } // default random usernames are 32 so we skip these.. usernames shouldnt be this long anyways. I know its kinda a hack.
  }, { username: 1, "_created_on": 1 }, //only return data we need
    (err: Error, resp: any) => {
      res.json(resp)
    })
});

app.post("/api/v3/state/query", (req: any, res: any) => {
  if (!req.user) { res.json({ error: "user not authenticated" }); return; }

  if ((req.user) && (req.user.level) > 0) {
    if (!req.body.id) { res.json({ "error": "id parameter missing" }); return; }

    var meta = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method
    }

    if (req.body.data) {
      state.queryProject(db, req.user, req.body, meta, (packet: any) => {

        io.to(req.user.apikey).emit('post', packet.payload);
        io.to(req.user.apikey + "|" + req.body.id).emit('post', packet.payload);

        for (var p in plugins) {
          if (plugins[p].handlePacket) {
            plugins[p].handlePacket(db, packet, (err: Error, packet: any) => {

            });
          }
        }

        res.json(packet);

      })
    } else {
      state.queryProject(db, req.user, req.body, meta, (packet: any) => { res.json(packet); })
    }
  }

});

app.get("/api/v3/plugins/definitions", (req: any, res: any) => {

  var definitions: any = [];

  for (var plugin of plugins) {
    if (plugin.workflow) {
      log("loading workflow definitions for plugin: " + plugin.name)
      definitions.push(plugin.workflowDefinitions);
    }
  }

  res.json({ definitions })
})

export function processPacketWorkflow(db: any, apikey: string, deviceId: string, packet: any, plugins: any, cb: any) {

  db.states.find({ apikey: apikey }, (err: Error, states: any) => {
    if (err) { log("WORKFLOW ERROR"); }

    var statesObj: any = {}
    for (var s in states) { statesObj[states[s].devid] = states[s]; }

    var state: any = {};
    for (var s in states) {
      if (states[s].devid == deviceId) {
        state = states[s];
      }
    }

    if (state) {
      if (state.workflowCode) {
        // WORKFLOW EXISTS ON THIS DEVICE

        var sandbox: any = {
          http: require("http"),
          https: require("https"),
          state: state,
          states: states,
          statesObj: statesObj,
          packet: packet,
          callback: (packetDone: any) => {
            //if (alreadyExitScript == false) { 
            packetDone.err = "";
            alreadyExitScript = true;
            cb(undefined, packetDone);
            //}

          }
        }

        for (var plugin of plugins) {
          if (plugin.workflow) {
            sandbox[plugin.name] = plugin.workflow;
          }
        }

        var alreadyExitScript = false;

        const vm = new VM({
          timeout: 1000,
          sandbox: sandbox
        });

        // Sync
        try {
          vm.run(state.workflowCode);
        } catch (err) {
          //console.error('Failed to execute script.', err);

          //if (alreadyExitScript == false) { 
          log("VM WORKFLOW ERROR!")
          //console.error(err);
          alreadyExitScript = true;
          packet.err = err.toString();
          cb(undefined, packet);
          //}        
        }
      } else {
        // NO WORKFLOW ON THIS DEVICE
        cb(undefined, packet);
      }
    } else {
      // NO DEVICE YET
      cb(undefined, packet);
    }
  })
}

var server;

if (config.ssl) {
  server = https.createServer(config.sslOptions, app);
} else {
  server = http.createServer(app);
}

/* ############################################################################## */

var io = require('socket.io')(server);

io.on('connection', function (socket: any) {
  setTimeout(function () {
    socket.emit("connect", { hello: "world" })
  }, 5000)


  socket.on('join', function (path: string) {
    socket.join(path);
  });

  socket.on('post', (data: any) => {
    for (var key in socket.rooms) {
      if (socket.rooms.hasOwnProperty(key)) {

        var testkey = key;

        if (key.split("|").length == 2) { testkey = key.split("|")[0] }

        var packet = {
          id: data.id,
          data: data.data,
          meta: { method: "socketioclient" }
        }

        handleDeviceUpdate(testkey, packet, { socketio: true }, (e: Error, r: any) => { });

      }
    }
  })
  socket.on('disconnect', function () { })
});

if (config.ssl) {
  server.listen(443);

  // temporary open ports for shockwave pivot
  var httpserver = http.createServer(app);
  httpserver.listen(80);

  // REDIR TO HTTPS
  // var http = require('http');
  // http.createServer(function (req: any, res: any) {
  //   res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  //   res.end();
  // }).listen(80);

  /////
} else {
  trex.log("HTTP\tServer port: " + config.httpPort)
  server.listen(config.httpPort);
}

server.on('error', (e: any) => {

  if (e.code == "EACCES") {
    trex.log("\nERROR do you have permission for this port? Try sudo.\n")
  } else {
    trex.log(e);
  }
})

process.on('unhandledRejection', log);
process.on("uncaughtException", log);
