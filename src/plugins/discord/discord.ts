
import * as events from "events";

const Discord = require('discord.js');

export var botsMem: any = {};

export const name = "discord"

export const workflowDefinitions = [
  "var " + name + " = { ",
  "sendmsg: (channelId:string, message:string)",
  "}"
];

export const workflow = {
  sendmsg: sendmsg
}

export function sendmsg(channelId: string, message: string) {
  console.log(message);
  bot.channels.get(channelId).send(message);
}

export var bot: any;

export function init(app: any, db: any, eventHub: events.EventEmitter) {


  eventHub.on("device", (data: any) => { })

  eventHub.on("plugin", (data: any) => { })

  app.get("/api/v3/discord/bots", (req: any, res: any) => {
    db.plugins_discord.find({ apikey: req.user.apikey }, (err: Error, bots: any) => {
      if (err) { res.json(err); return; }
      res.json(bots);
    })
  })

  app.post("/api/v3/discord/savebot", (req: any, res: any) => {
    if (req.user.level < 100) { res.json({ err: "permission denied" }); return; }

    var bot = req.body;
    bot.apikey = req.user.apikey;

    savebot(db, bot, (err: Error, botoptions: any) => {
      if (err) {
        res.json({ err: err.toString() });
      } else {
        connectbot(db, botoptions, eventHub, (err: Error, resp: any) => { })
        res.json(botoptions);
      }

    })
  })

  //connect bots..
  db.plugins_discord.find({}, (err: Error, bots: any) => {
    for (var b in bots) {
      console.log(bots[b]);
      connectbot(db, bots[b], eventHub, (err: Error, bot: any) => {

      })
    }
  })

}


export function savebot(db: any, botoptions: any, cb: any) {
  db.plugins_discord.save(botoptions, cb);
}

export function connectbot(db: any, botOptions: any, eventHub: any, cb: any) {
  bot = new Discord.Client();

  bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
    cb(undefined, bot);
  });


  bot.on('message', (msg: any) => { if (msg.content === 'ping') { msg.reply('pong'); } });
  bot.login(botOptions.token);
}