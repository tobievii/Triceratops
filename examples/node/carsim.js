var socket = require("socket.io-client")("http://localhost:8080");

socket.on("connect", function(data) {
	console.log("connected.");
	socket.emit("join", "glp5xm1jpwhtwdnsykv5nv4hhwrp1xy9"); // your api key

	socket.on("post", data => {
		console.log(data);
	});
});




var car = {
  id : "rouan944",
  data: {
    speed : 83.1,
    gear : 4,
    input: {
      throttle : 55,
      brake : 0,
      clutch : 25,
      steeringAngle: 0
    },
    gps: {
      lat: 25.123,
      lon: 28.125
    }
  }  
}

setInterval( ()=>{
  socket.emit("post", car )
},2500)