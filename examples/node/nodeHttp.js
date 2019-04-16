const http = require('http');
//const https = require('https');

function postData() {
    var packet = {
      "id": "nodeDevice",
      "data": {
        "temperature": 24.54,
        "doorOpen": false,
        "gps": {
          "lat": 25.123,
          "lon": 28.125
        }
      }
    }
    const postData = JSON.stringify(packet);
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/api/v3/data/post',
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from("api:key-mfradh6drivbykz7s4p3vlyeljb8666v").toString('base64'),
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    // CREATE REQUEST OBJECT
    
    const req = http.request(options, (res) => {
    //const req = https.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => { console.log(`BODY: ${chunk}`); });
        res.on('end', () => { console.log('No more data in response.'); });
    });

    req.on('error', (e) => { console.error(`problem with request: ${e.message}`); });
    req.write(postData);
    req.end();
}

postData();