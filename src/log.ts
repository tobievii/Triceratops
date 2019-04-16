import { EventEmitter } from "events"

export class Logger extends EventEmitter {
  db: any;

  constructor() {
    super();
  }

  connectDb(db: any) {
    this.db = db;
  }

  log(a: any) {

    var now = new Date();
    if (typeof a == "object") {
      console.log(now.toISOString() + "\t" + JSON.stringify(a))
    } else {
      console.log(now.toISOString() + "\t" + a)
    }

    if (this.db) {
      var logentry: any = {}
      logentry["_created_on"] = new Date();
      logentry.data = a;
      //this.db.log.save(logentry);
    } else {
      console.log(now.toISOString() + "\t" + "LOGGER DB NOT CONNECTED YET")
    }

  }
}


export var logger = new Logger();
export function log(a: any) { logger.log(a); }
export function logDb(db: any) { logger.connectDb(db); }