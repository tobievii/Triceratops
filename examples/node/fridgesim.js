var socket = require("socket.io-client")("http://localhost:8080");

socket.on("connect", function(data) {
	console.log("connected.");
	socket.emit("join", "glp5xm1jpwhtwdnsykv5nv4hhwrp1xy9"); // your api key

	socket.on("post", data => {
		console.log(data);
	});
});

setInterval( ()=>{

  socket.emit("post", {id: "fridgeSim", data: { temperature: Math.round(Math.random()*30) } } )

},1000)