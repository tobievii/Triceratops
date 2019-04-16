import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.css";
import "./prototype.scss"

import { NavBar } from "./components/navBar.jsx";
import { Account } from "./public/account.jsx"
// not logged in content:
import { Landing } from "./public/landing.jsx"


import { UserPage } from "./components/userpage.jsx"
import { Recovery } from "./public/recovery.jsx";
import { Encrypt } from "./public/encrypt.jsx";
// logged in content:
import { Verify } from "./components/verify.jsx";
import { ApiInfo } from "./components/apiInfo.jsx";
import { DeviceView } from "./components/deviceView.jsx";
import { StatesViewer } from "./components/statesViewer.jsx";
import { SettingsView } from "./components/settingsView.jsx";
import { NotificationsView } from "./components/notificationsView.jsx";


import Stats from "./components/stats.jsx"
import Footer from "./public/footer.jsx"
import * as p from "./prototype.ts"

import socketio from "socket.io-client";
var socket = socketio();
const publicVapidKey =
    "BNOtJNzlbDVQ0UBe8jsD676zfnmUTFiBwC8vj5XblDSIBqnNrCdBmwv6T-EMzcdbe8Di56hbZ_1Z5s6uazRuAzA";

const test = {
    un: undefined,
    acc: undefined,
    dc: undefined,
    ds: undefined
}

class App extends Component {
    state = {};

    constructor(props) {
        super(props);
        p.getAccount(account => {
            this.setState({ account });
            if (account.level > 0) {
                socket.emit("join", account.apikey);
                this.setState({ loggedIn: true })
            }
        })

        p.getVersion((version) => { this.setState({ version: version.version.toUpperCase() }); })

        socket.on("connect", a => {
            socket.on("notification", a => {
                p.getAccount(account => {
                    this.setState({ account });
                })
            })

        });

        p.getStates((states) => { this.setState({ states }) })

        this.serviceworkerfunction();
    }

    serviceworkerfunction = () => {
        if ('serviceWorker' in navigator) {
            if (supportsServiceWorkers(location, navigator)) {
                workerInit().catch(err => console.error(err));
            }
        }

        function supportsServiceWorkers(location, navigator) {
            if (location.hostname === `localhost` || location.protocol === `https:`) {
                return `serviceWorker` in navigator
            }
            return false
        }

        async function workerInit() {
            const register = await navigator.serviceWorker.register('/serviceworker.js', {
                scope: "/"
            });

            socket.on("pushNotification", a => {
                var message = "has been successfuly added to PROTOTYP3.";
                if (a.type == "ALARM") {
                    message = a.message;
                } else if (a.type == "CONNECTION DOWN 24HR WARNING") {
                    message = "hasn't sent data in the last 24hours";
                }
                register.showNotification(a.type, {
                    body: '"' + a.device + '" ' + message,
                    icon: "./iotnxtLogo.png"
                });
            })

            const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            await fetch("/subscribe", {
                method: "POST",
                body: JSON.stringify(subscription),
                headers: {
                    "content-type": "application/json"
                }
            });
        }

        function urlBase64ToUint8Array(base64String) {
            const padding = "=".repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/\-/g, "+")
                .replace(/_/g, "/");

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }
    }

    // socketHandler = (socketDataIn) => {
    //     if (this.state.states) {
    //         var newArray = this.state.states.slice();

    //         var found = 0;
    //         for (var s in newArray) {
    //           if (newArray[s].id == socketDataIn.id) {
    //             found = 1;
    //             var mergedEntry = _.merge(newArray[s], socketDataIn);
    //             newArray[s] = mergedEntry;
    //             this.setState({ states: newArray });
    //           }
    //         }

    //         if (found == 0) {
    //           newArray.push(socketDataIn);
    //           this.setState({ states: newArray });
    //         }

    //         ///////////

    //         if (this.state.view) {
    //           var copyView = Object.assign({}, this.state.view); //creating copy of object

    //           var view = _.merge(copyView, socketDataIn);

    //           this.setState({ view });
    //         }

    //         if (this.state.packets) {
    //           var newPackets = this.state.packets.slice().reverse();
    //           var payload = socketDataIn; //{data: socketDataIn.data, timestamp: socketDataIn.timestamp}
    //           newPackets.push(payload);
    //           this.setState({ packets: newPackets.reverse() });
    //         }
    //       }
    // }

    setProps = (a) => {
        test.un = a.un;
        test.acc = a.acc;
        test.dc = a.dc;
        test.ds = a.ds;
    }

    home = ({ match }) => {
        if (this.state.account) {
            if (this.state.account.level > 0) {
                return (
                    <div>
                        {/* <Dashboard state={this.state.states} /> */}
                        <StatesViewer sendProps={this.setProps} username={this.state.account.username} account={this.state.account} public={false} visiting={false} />
                        <ApiInfo apikey={this.state.account.apikey} />
                        <Stats />
                        <Footer loggedIn={true} />
                    </div>
                )
            } else {
                return (
                    <div>
                        <Account account={this.state.account} />
                        <Landing />
                        <StatesViewer sendProps={this.setProps} username={this.state.account.username} account={this.state.account} public={true} visiting={false} />
                        <Footer loggedIn={false} />
                    </div>)
            }
        } else {
            return null
        }
    }

    deviceView = ({ match }) => {
        return (
            <div>
                <DeviceView
                    devid={match.params.devid}
                    username={match.params.username}
                    acc={test.acc}
                    deviceCall={test.dc}
                    devices={test.ds}
                    account={this.state.account}
                />
            </div>
        )
    }

    userView = ({ match }) => {
        return (
            <div>
                <UserPage username={match.params.username} />
                <StatesViewer sendProps={this.setProps} username={match.params.username} account={this.state.account} public={false} visiting={true} />
                <Footer />
            </div>

        )
    }

    recoverPassword = ({ match }) => {
        return (
            <div>
                <Recovery recoverToken={match.params.recoverToken} />
            </div>
        )
    }

    secure = ({ match }) => {
        return (
            <div>
                <Encrypt />
            </div>
        )
    }

    settings = ({ match }) => {
        return (
            <SettingsView />
        )
    }

    notifications = ({ match }) => {
        return (
            <NotificationsView />
        )
    }

    render() {
        return (
            <div className="App">

                <Router>
                    <div>
                        <NavBar version={this.state.version} account={this.state.account} />
                        <Route exact path="/" component={this.home} />
                        <Route path="/recover/:recoverToken" component={this.recoverPassword} />
                        <Route path="/view/:devid" component={this.deviceView} />
                        <Route exact path="/u/:username" component={this.userView} />
                        <Route exact path="/u/:username/view/:devid" component={this.deviceView} />
                        <Route path="/settings" component={this.settings} />
                        <Route exact path="/accounts/secure" component={this.secure} />
                        <Route path="/notifications" component={this.notifications} account={this.state.account} />
                    </div>
                </Router>
            </div>
        )
    }
}

export default App;