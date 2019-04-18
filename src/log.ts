import { EventEmitter } from "events"


export function log(a: any, b?: any, c?: any) {

  var clean = "";

  var now = new Date();
  if (typeof a == "object") {
    console.log(now.toISOString() + "\t" + JSON.stringify(a))
  } else {
    clean += now.toISOString() + "\t" + a
  }

  if (b) {
    clean += "\t" + b;
  }

  if (c) {
    clean += "\t" + c;
  }

  console.log(clean);
  // if (this.db) {
  //   var logentry: any = {}
  //   logentry["_created_on"] = new Date();
  //   logentry.data = a;
  //   //this.db.log.save(logentry);
  // } else {
  //   console.log(now.toISOString() + "\t" + "LOGGER DB NOT CONNECTED YET")
  // }
}



