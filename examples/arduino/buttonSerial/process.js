/*
    This example works in conjunction with /examples/arduino/buttonSerial
*/

if (packet.data.led) {

    // HANDLE LED CONTROL COMMANDS
    if (packet.data.led == "on") {
        serialports.write(state.payload.data.device.comName, "1", () => {
            callback(packet);
        })
    }

    if (packet.data.led == "off") {
        serialports.write(state.payload.data.device.comName, "0", () => {
            callback(packet);
        })
    }
    
} else {

    // HANDLE DATA FROM THE DEVICE
    if (packet.data.raw == "1") {
        //discord.sendmsg("507087720930082819", "BUTTON PRESSED!")
    } else {
        //discord.sendmsg("507087720930082819", "hello button is up")
    }

    callback(packet);
}