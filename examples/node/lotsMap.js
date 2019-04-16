var socket = require("socket.io-client")("http://localhost:8080");

var devices = []

for (var a = 0; a < 30; a++) {

    devices.push({ id: "device" + a, data: { gps: { lat: -25.8646859, lon: 28.2064464 } } })
}

var count = 0;


socket.on("connect", function (data) {
    console.log("connected.");
    socket.emit("join", "4vpw5gtrw4p3mdunmxpbm3qp76n37q4g"); // your api key

    socket.on("post", data => {
        console.log(data);
    });
});

setInterval(() => {


    devices[count].data.gps.lat += (Math.random() * 0.001) - 0.0005
    devices[count].data.gps.lon += (Math.random() * 0.001) - 0.0005
    socket.emit("post", devices[count])
    count++
    if (count > devices.length - 1) { count = 0 }


}, 100)