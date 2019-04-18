export var plugins = []


plugins.push(require("./account/pluginAccount.jsx"))
plugins.push(require("./admin/admin_main.jsx"))
plugins.push(require("./iotnxt/pluginIotnxt.jsx"))
plugins.push(require("./discord/discord.jsx"))
plugins.push(require("./http/pluginHTTP.jsx"))
plugins.push(require("./tcp/pluginTcp.jsx"))
plugins.push(require("./teltonika/plugin_teltonika.jsx"))
//plugins.push(require("./serialports/pluginSerialPort.jsx"))
//plugins.push(require("./editor/pluginEditor.jsx"))