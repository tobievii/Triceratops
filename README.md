![alt text](https://i.imgur.com/FpnXB3n.png)

Live: https://prototype.iotnxt.io   
Discord: https://discord.gg/rTQmvbT

IoT framework for general purpose remote monitoring/control.   
Built using [typescrypt](https://www.typescriptlang.org/), [webpack](https://webpack.js.org/),[react](https://reactjs.org/), [mongoDB](https://www.mongodb.com/), [express](https://expressjs.com/) and [socket.io](https://socket.io/).

## Features

- Simple as possible to connect your devices. See /examples or the documentation below.
- Multi protocol support: HTTP/S, MQTT, socketio, raw TCP, USB serialports and more. 
- Opensource so you can be sure what happens with your data.
- Runs on windows/mac/linux, in the cloud or even a raspberry pi.
- Fast mongodb for the data.
- Extendable plugin architecture.
- Edit code in the browser using the VSCode editor with intellisense autocompletion and deploy custom code instantly.

See a live realtime list of your devices, when they were last active and a summary of the raw data state.

You can set javascript code to process the device JSON data server side (using sandboxed VM) to make REST calls or perform different actions depending on the state of other devices.

## Tutorial

[![01 Getting started](https://img.youtube.com/vi/JqwMZ8O7OlY/0.jpg)](https://www.youtube.com/watch?v=JqwMZ8O7OlY)

# Install instructions

Clone the repo.

```bash
git clone https://github.com/IoT-nxt/prototype.git
```

## Install runtime, database etc..

You'll need to install [Node.js](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/download-center/community) as a minimum.

Useful additional tools include [Visual Studio Code](https://code.visualstudio.com/), 
[Robo 3T](https://robomongo.org/), 

## _Step 1_ **_Build the client side app_**

```sh
cd prototype/client # client folder
npm i               # install node_modules for client side
npm run buildwatch  # build automatically on file changes
npm run build       # or just build once
```

## _Step 2_ **_Build and run the backend server_**

```sh
cd prototype        # main server folder
npm i               # install node_modules for server side

# if you're installing on Windows, you'll need to install webpack dependencies
npm install webpack-dev-server

npm run buildwatch  # build automatically on server file changes for development
npm run build       # or build for production
```

## _Step 3_ **_Run the backend server_**

```sh
cd build
node main.js        # runs the server

# or even better, auto restart on file changes:
nodemon main.js     # npm i nodemon -g
```

Go to [http://localhost:8080/](http://localhost:8080/) and log in with the default account:

       email: admin@localhost.com
    password: admin

# Roadmap

## Phase 1 (Proof of concept) - 100% Done

This was the stealth phase. It has been built and is being used on a daily basis by multiple parties.

* Users can register. (Landing page, registration, email verification)
* Users can add (any*) device, (Documentation)
* Devices can send data in various protocols/formats. (HTTP/SOCKETIO/MQTT/TELTONIKA etc..)
* Devices can be linked to IoTnxt platform. (IoTnxt gateway management, bidirectional)
* Platform can emit commands to devices. (From commander to device)
* Users can reprogram how the platform handles and propagates data. (Workflow/processing functionality)


## Phase 2 (Foundation) - 50% - In progress 

During this phase we focus on building the foundation strong and elegantly.
With our end goals in sight there will be basic functionality or structure we'd need to refine to be able to build the functionality we plan to meet.

* Dashboard - Basic widgets for viewing historical data. As well as the api/db calls needed to make this happen.

      * Calendar (DONE)
      * Line graphs (DONE)
      * Gauge widget (DONE)
      * UI Button widget (DONE)


* 3D capability - Built to handle current and future demand on spacial awareness. (Factory/Space/City) This includes VR interface to view data as well as set up areas for triggers.   

      * 3D Widget (80%)
      * VR compatible   
      * Vector math functions in workflows
      * 3D area triggers   
      * Documentation for the workflow/processing editor   

* Social - Here we will focus on the social aspects of IoT. Sharing of devices, security and permissions, groups and ease of use. We need to make it possible to copy paste a URL, and the new user would be able to simply click the link and directly gain the value of the information shared. This could be a local weather station device, traffic camera, parking sensor and so on. From here it should be as simple as possible to link this data to a third party service (api), website (embed snippet)  and so on.

      * Extend API documentation/
      * Develop tutorial content
      * Embeddable snippet of html

* Branding/Themeing (white labeling) - Simplification of the stylesheets, with some basic white label theme as default. This will enable partners to easily/quickly modify prototype and enable them to resell to their customers/industry.

      * Colour/logo variables at the top of the scss stylesheet
      * Simplification/optimization of style classes
      * Cleanup of hardcoded react html code 

* Streamlining adding devices - Prototype/develop some IoT devices that are SUPER easy to add to the platform.

      * ESP32 + LDR light sensor. Software flashes a block of pixels to transfer connection information.
      * Arduino temperature sensor.
      * Embeddable snippet for monitoring your website.

## Phase 3 (Expansion)

* Mission critical dashboards - Harden the system to survive severe data spikes or timeouts. Maintain uptime and handle high datarates.

* Mobile - Fix all mobile usage issues for chrome browser. 
Investigate possibility of converting React app to apple/android app.

* High datarate streams -  Video/audio/telemetry or even realtime robotic control. Enable the system to handle raw video/audio and telemetry data streams. Perform cloud machine vision, backup and retrieval. Another use case would be highdata rate vehicle telemetry like racecars, aerospace and drones.

* Integrations - At this stage we should have a large amount of devices/individuals/companies using the platform. We need to enable deep integration between these and develop the components that are missing. Integrations from home assistant and other IoT platforms can enable rapid growth and increased capability.


# DOCUMENTATION

## HTTP REST API

To get started we recommend using the HTTP REST api at first. After you've logged into your account using the web interface you will find your api key and pregenerated HTTP Authorization headers at the bottom of the screen:

![webapi example](https://i.imgur.com/n86DoeL.png)

GET [http://localhost:8080/api/v3/version](http://localhost:8080/api/v3/version)

Returns the server version:

```json
{ "version": "5.0.30", "description": "prototype" }
```

---

GET [http://localhost:8080/api/v3/account](http://localhost:8080/api/v3/account)

Returns your account information:

```json
{
  "_id": "5bd359c27e6e3a36fc4dbfa4",
  "uuid": "v856q9myqoc0bozhyj835liy7ketfc9oqrimt2vm7buzdjyxn6tz9ds71lvtpi3smlzuq3urbyvi1r80ovwmj6ra37bh7yx2xhjw288ite658yv94zens9naflylo5tz",
  "created": { "unix": 1540577730242, "jsonTime": "2018-10-26T18:15:30.242Z" },
  "lastSeen": { "unix": 1540577730242, "jsonTime": "2018-10-26T18:15:30.242Z" },
  "ip": "",
  "ipLoc": null,
  "userAgent": "defaultAdmin",
  "emailverified": false,
  "email": "admin@localhost.com",
  "apikey": "mfradh6drivbykz7s4p3vlyeljb8666v",
  "level": 100,
  "settingsMenuTab": 3
}
```

---

POST [http://localhost:8080/api/v3/data/post](http://localhost:8080/api/v3/data/post)

You can post JSON formatted data to the api as a device.

```json
{
  "id": "yourDevice001",
  "data": {
    "temperature": 24.54,
    "doorOpen": false,
    "gps": {
      "lat": 25.123,
      "lon": 28.125
    }
  }
}
```

RESPONSE:

```json
{"result":"success"}
```

---

GET [http://localhost:8080/api/v3/states](http://localhost:8080/api/v3/states)

Returns your account's summarized device states.

```json
[
  {
    "id": "usb-Unknown_Arduino_M0_Pro_396E300A514D30324A4B2020FF0F311F-if00",
    "data": {
      "device": {
        "manufacturer": "Unknown",
        "serialNumber": "396E300A514D30324A4B2020FF0F311F",
        "pnpId": "usb-Unknown_Arduino_M0_Pro_396E300A514D30324A4B2020FF0F311F-if00",
        "locationId": null,
        "vendorId": "2a03",
        "productId": "804f",
        "comName": "/dev/ttyACM0"
      },
      "options": { "baudRate": 115200 },
      "raw": "{\"id\":\"flowMeter\",\"data\":{\"up\":59446000,\"flow\":0}}",
      "datajson": { "id": "flowMeter", "data": { "up": 59446000, "flow": 0 } },
      "err": "",
      "connected": true
    },
    "meta": { "method": "serialport" },
    "timestamp": "2018-10-27T13:45:32.765Z"
  },
  {
    "id": "flowMeter",
    "data": { "up": 59446000, "flow": 0 },
    "level": 1,
    "serial": {
      "device": {
        "manufacturer": "Unknown",
        "serialNumber": "396E300A514D30324A4B2020FF0F311F",
        "pnpId": "usb-Unknown_Arduino_M0_Pro_396E300A514D30324A4B2020FF0F311F-if00",
        "locationId": null,
        "vendorId": "2a03",
        "productId": "804f",
        "comName": "/dev/ttyACM0"
      },
      "options": { "baudRate": 115200 },
      "raw": "{\"id\":\"flowMeter\",\"data\":{\"up\":59446000,\"flow\":0}}",
      "datajson": { "id": "flowMeter", "data": { "up": 59446000, "flow": 0 } },
      "err": "",
      "connected": true
    },
    "meta": { "method": "serialport" },
    "flowtotal": 7462,
    "err": "",
    "timestamp": "2018-10-27T13:45:32.764Z",
    "totalup": 50422000
  }
]
```

GET [/api/v3/states/full](/api/v3/states/full)

Returns your account's full device states. Includes additional meta data as well as workflow processing code on each device.

```json
[
  {
    "_id": "5bd3739e915407a02b04ea81",
    "apikey": "mfradh6drivbykz7s4p3vlyeljb8666v",
    "devid": "usb-Unknown_Arduino_M0_Pro_396E300A514D30324A4B2020FF0F311F-if00",
    "payload": {
      "id": "usb-Unknown_Arduino_M0_Pro_396E300A514D30324A4B2020FF0F311F-if00",
      "data": {
        "device": {
          "manufacturer": "Unknown",
          "serialNumber": "396E300A514D30324A4B2020FF0F311F",
          "pnpId": "usb-Unknown_Arduino_M0_Pro_396E300A514D30324A4B2020FF0F311F-if00",
          "locationId": null,
          "vendorId": "2a03",
          "productId": "804f",
          "comName": "/dev/ttyACM0"
        },
        "options": { "baudRate": 115200 },
        "raw": "{\"id\":\"flowMeter\",\"data\":{\"up\":59623000,\"flow\":0}}",
        "datajson": {
          "id": "flowMeter",
          "data": { "up": 59623000, "flow": 0 }
        },
        "err": "",
        "connected": true
      },
      "meta": { "method": "serialport" },
      "timestamp": "2018-10-27T13:48:29.743Z"
    },
    "meta": {
      "user": {
        "email": "admin@localhost.com",
        "uuid": "v856q9myqoc0bozhyj835liy7ketfc9oqrimt2vm7buzdjyxn6tz9ds71lvtpi3smlzuq3urbyvi1r80ovwmj6ra37bh7yx2xhjw288ite658yv94zens9naflylo5tz"
      },
      "created": {
        "unix": 1540648109743,
        "jsonTime": "2018-10-27T13:48:29.743Z"
      },
      "ip": "",
      "ipLoc": {},
      "userAgent": null,
      "uuid": "otxbkytav97vonsllim4uajcpbvm51uxe4eh9t9nx505e2t296a47od8fv0mqam6hg0euv3gws8hmy8f73noikyz4qyl4crdajts4z7ke5usckh1uos69fgj9jnxjd1o",
      "method": "serialport"
    }
  },
  {
    "_id": "5bd37c71915407a02b062f23",
    "apikey": "mfradh6drivbykz7s4p3vlyeljb8666v",
    "devid": "flowMeter",
    "payload": {
      "id": "flowMeter",
      "data": { "up": 59623000, "flow": 0 },
      "level": 1,
      "serial": {
        "device": {
          "manufacturer": "Unknown",
          "serialNumber": "396E300A514D30324A4B2020FF0F311F",
          "pnpId": "usb-Unknown_Arduino_M0_Pro_396E300A514D30324A4B2020FF0F311F-if00",
          "locationId": null,
          "vendorId": "2a03",
          "productId": "804f",
          "comName": "/dev/ttyACM0"
        },
        "options": { "baudRate": 115200 },
        "raw": "{\"id\":\"flowMeter\",\"data\":{\"up\":59623000,\"flow\":0}}",
        "datajson": {
          "id": "flowMeter",
          "data": { "up": 59623000, "flow": 0 }
        },
        "err": "",
        "connected": true
      },
      "meta": { "method": "serialport" },
      "flowtotal": 7462,
      "err": "",
      "timestamp": "2018-10-27T13:48:29.748Z",
      "totalup": 50599000
    },
    "meta": {
      "user": {
        "email": "admin@localhost.com",
        "uuid": "v856q9myqoc0bozhyj835liy7ketfc9oqrimt2vm7buzdjyxn6tz9ds71lvtpi3smlzuq3urbyvi1r80ovwmj6ra37bh7yx2xhjw288ite658yv94zens9naflylo5tz"
      },
      "created": {
        "unix": 1540648109748,
        "jsonTime": "2018-10-27T13:48:29.748Z"
      },
      "ip": "",
      "ipLoc": {},
      "userAgent": "api",
      "uuid": "vgkhkkklbu7c8jkxhpy75jnhmchmx43z15hlfptu7zsjynzsy187l2mpoaennjdgei5afbroizjqycz7imhe7gmd2y9dmwv4d35du8uqztxb87ayqrkpoyo2fc9mlqht",
      "method": "serialport"
    },
    "workflowCode": "\ncountTotal(packet.data.flow, \"flowtotal\")\ncountTotal(1000,\"totalup\")\n\ncallback(packet); \n\n\nfunction countTotal(val, varname) {\n\n    if (state.payload[varname]) {\n        packet[varname] = state.payload[varname] + val;\n    }  else {\n        packet[varname] = val;\n    }\n\n}"
  }
]
```


# PLUGINS

## Plugin: Iot.nxt

Enables linking device state bidirectionally to the [Iot.nxt](https://www.iotnxt.com/) cloud.

![iotnxt gateway connected](https://i.imgur.com/9LoepRr.png)

---

## Plugin: Serialports

![serialport autodetect](https://i.imgur.com/bIEqUL6.png)

The serialports plugin enables autodetection of arduino or similar serialport devices. Also enables the serialports object in process scripts that enables listing of devices and writing to ports.

