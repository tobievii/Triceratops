"use strict";
exports.__esModule = true;
exports.name = "notifications";
exports.workflowDefinitions = [
    "var " + exports.name + " = { ",
    "warning: (message:string)",
    "alarm1: (message:string)",
    "info: (message:string)",
    "}"
];
exports.workflow = { warning: warning, alarm1: alarm1, info: info };
function warning(message) {
    console.log(message);
}
exports.warning = warning;
function alarm1(message) {
    console.log(message);
}
exports.alarm1 = alarm1;
function info(message) {
    console.log(message);
}
exports.info = info;
function init(app, db, eventHub) {
}
exports.init = init;
