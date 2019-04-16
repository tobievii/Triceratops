var mongojs = require('mongojs')
var ObjectId = mongojs.ObjectId;

import * as accounts from "../../accounts"
import * as events from "events";
import * as _ from "lodash";

export var name = "account";

const request = require('request');

export function handlePacket(db: any, packet: any, cb: any) {
}

export function init(app: any, db: any, eventHub: events.EventEmitter) {

    app.post("/api/v3/account/checkupdateusername", (req: any, res: any) => {
        checkupdateusername(db, req.body.username, (result:any) =>{
            res.json(result)
        })
    })

    app.post("/api/v3/account/updateusername", (req:any, res:any)=>{
        checkupdateusername(db, req.body.username, (result:any) =>{
            if (result.available == true) {
                updateusername(db, req.user.uuid, result.username, ()=>{
                    res.json({})
                })
            }
        })
    })

    app.get("/api/v3/user/:username", (req: any, res: any) => {
        getuser(db, req.params.username, (user: any)=>{
            res.json(user);
        })
    })


}

function checkupdateusername(db:any, username:string, cb:any) {
    //checks to see if a username has been taken by someone
    db.users.find({username: username}).count((e:Error, result:any) => {
        if (result == 0) {
            // available
            cb({username: username, available:true})
        } else {
            cb({username: username, available:false})
        }
        
    })
}

function updateusername(db:any, uuid:any, username:string, cb:any) {
    db.users.findOne({uuid:uuid}, (e:Error, user:any)=>{
        user["_last_seen"] = new Date();
        user["username"] = cleaner(username);
        db.users.update({uuid:uuid}, user, (e2:Error, r2:any)=>{
          cb();
        })
      })

}

function cleaner(str:string) {
    var strLower = str.toLowerCase();
    return strLower.replace(/\W/g, '');    
}


function getuser(db:any, username:any, cb:any) {
    // gets a user by username and sanitizes data for security purposes.
    db.users.findOne({username:username}, (e:Error, user:any)=>{

        //delete user["_id"]
        var cleandata = _.clone(user);        
        delete cleandata["password"]
        delete cleandata["uuid"]
        


        db.states.find({apikey:user.apikey}, (e:Error, states:any)=>{
            cleandata.devicecount = states.length;

            githubAccount(user.email, (result:any)=>{
                cleandata.github = result;
                cb(cleandata);
            })

            
        })
    })
}




function githubAccount(email:string, cb:any) {
    var options = {
        url: "https://api.github.com/search/users?q="+email+"+in%3Aemail",
        headers: { 'User-Agent': 'prototyp3' }
    }

    console.log(options)

    request(options, function (error:any, response:any, body:any) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
        var result = JSON.parse(body)

        if (result["total_count"] > 0 ) {
            cb(result.items[0])
        } else {
            cb(undefined);
        }
      });
}