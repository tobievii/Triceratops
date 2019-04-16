/*
*   Test server for portable WiFi Scanner
*/
var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send('Test Server for ESP32 WiFi scanner');
});

app.use('/checkconnexion', function (req, res, next) {
  console.log("check server connection received");
  res.sendStatus(200);

});

// Server Port 
app.listen(8080);