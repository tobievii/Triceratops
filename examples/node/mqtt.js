var mqtt = require('mqtt');
var config = { apikey: "4oxk9bg32xyncaxr6494z6jkqxb61tmf" };
var client = mqtt.connect('mqtt://localhost', { username: "api", password: "key-" + config.apikey });

var a = 0;

client.on('connect', function () {
	console.log("connected.");

	client.subscribe(config.apikey + "|mqttDevice01", function (err) {
		if (err) { console.log(err) }
		console.log("subscribed.")
	})


})

setInterval(() => {
	a += Math.random() - 0.5
	client.publish(config.apikey, JSON.stringify({ id: "mqttDevice01", data: { a } }));
}, 1000)

client.on('message', function (topic, message) {
	console.log(message.toString())
})