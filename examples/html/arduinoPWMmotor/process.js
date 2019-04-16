/*
    This example works in conjunction with /examples/arduino/arduinoPWMmotor
*/

if (packet.data.motor) {
    if (packet.data.motor == "on") {
        serialports.write(state.payload.data.device.comName, "1", () => {
            callback(packet);
        })
    }

    if (packet.data.motor == "off") {
        serialports.write(state.payload.data.device.comName, "0", () => {
            callback(packet);
        })
    }
    
} else { callback(packet); }
