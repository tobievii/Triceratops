var net = require('net');
var mqtt = require('mqtt');

var _ = require("lodash")


var config = { apikey: "4oxk9bg32xyncaxr6494z6jkqxb61tmf" };
var client = mqtt.connect('mqtt://localhost', { username: "api", password: "key-" + config.apikey });

const devicename = "esp32mesh"

var meshState = {
  "id": "iotmesh_mine",
  "data": {
    nodes: [],
    mesh: []
    // mesh: [
    //   [0, [1, 2, 3]],
    //   [1, [4, 5]],
    //   [2, [5]],
    //   [3, [6]],
    //   [4, [8]],
    //   [5, [3]],
    //   [6, [7]],
    //   [7, []],
    //   [8, []]
    // ]

  },
  "options": {
    "_merge": false
  }
}


client.on('connect', function () {
  console.log("connected.");

  client.subscribe(config.apikey + "|" + meshState.id, function (err) {
    if (err) { console.log(err) }
    console.log("subscribed.")
  })

  setInterval(() => {
    heartbeat();
  }, 30000)
  heartbeat();
})

client.on('message', function (topic, message) {
  console.log(message.toString())
  var msg = JSON.parse(message);

  if (msg.data.cmd) {
    meshSocket.write(JSON.stringify(msg.data.cmd))
  }

  if (msg.data.meshClear) {
    process.exit();
  }

})

/*
{"cmd":{"addr":"ff:ff:ff:ff:ff:ff", "data":{"status":1}}}
*/







function heartbeat() {
  sendUpdate();
}


function sendUpdate() {
  meshState.data.timestamp = new Date().toISOString();
  meshState.data.uptime = process.uptime();
  var cleanmesh = _.cloneDeepWith(meshState);
  cleanmesh.data.mesh = JSON.stringify(cleanmesh.data.mesh);
  client.publish(config.apikey, JSON.stringify(cleanmesh));
}

var meshSocket;

var server = net.createServer((socket) => {
  meshSocket = socket;

  socket.on("data", (dataraw) => {
    //console.log(socket.remoteAddress)
    //
    //console.log(data.toString())
    var splitdata = dataraw.toString().trim().split("\n");
    try {
      for (var data of splitdata) {

        var dataparsed = JSON.parse(data.toString());
        console.log(dataparsed);
        var device = dataparsed.data;
        device.addr = dataparsed.addr;                // move addr into device 
        device.timestamp = new Date().toISOString();  // timestamp data

        updateMesh(device);
        sendUpdate();
      }

    }
    catch (e) {
      console.log("===== ERROR PARSING ====")
      console.log(e);
      console.log(dataraw.toString().trim().split("\n"));
      console.log("========================")
    }

  })

});

const portnum = 8071;
server.listen(portnum);
console.log("mesh server listening on " + portnum)




function updateMesh(device) {

  var found = false;
  for (var node in meshState.data.nodes) {
    if (meshState.data.nodes[node].addr == device.addr) { found = true; meshState.data.nodes[node] = device; }
  }

  if (found == false) {
    meshState.data.nodes.push(device);
  }

  /////////////////////////////

  meshState.data.mesh = buildMeshLayout(meshState.data.nodes);

  // if (device.layer == 1) {
  //   var found = 0;
  //   for (var m in meshState.data.mesh) {
  //     if (meshState.data.mesh[m][0] == device.addr) {
  //       found = 1;
  //     }
  //   }

  //   if (found == 0) {
  //     if (device.children) {
  //       meshState.data.mesh.push([device.addr, device.children])
  //     } else {
  //       meshState.data.mesh.push([device.addr, []])
  //     }

  //   }
  // }



}



function buildMeshLayout(nodes) {
  var mesh = []

  // FIND DEPTH
  var maxlayer = 0;
  for (var node of nodes) {
    if (node.layer > maxlayer) {
      maxlayer = node.layer;
    }
  }

  // ITERATE
  if (maxlayer > 0) {
    for (var l = 1; l <= maxlayer; l++) {
      //console.log(l);
      ////
      for (var node of nodes) {
        if (node.layer == l) {
          mesh.push([node.addr, node.children])
        }
      }
      ////
    }
  }


  // NEXT
  //console.log(maxlayer)
  return mesh;
}