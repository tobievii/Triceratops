import React, { Component } from "react";

import { confirmAlert } from './react-confirm-alert';
import './react-confirm-alert/src/react-confirm-alert.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSort, faSortNumericDown, faSortAlphaDown, faSortAmountDown } from '@fortawesome/free-solid-svg-icons'
import * as _ from "lodash"

import * as p from "../prototype.ts"

import { StatesViewerMenu } from "./statesViewerMenu.jsx"
import { StatesViewerItem } from "./statesViewerItem.jsx"
import { MapDevices } from "./dashboard/map.jsx"

import { ToastContainer, toast } from 'react-toastify';
import Media from "react-media";


library.add(faSort)
library.add(faSortNumericDown);
library.add(faSortAlphaDown);
library.add(faSortAmountDown);


import socketio from "socket.io-client";


export class Pagination extends Component {

  onClick = (button) => {
    return evt => {
      this.props.onPageChange(button)
    }
  }

  calcClass = (button) => {
    if (button.active) {
      return "pagination paginationActive"
    } else {
      return "pagination"
    }

  }

  render() {
    if (this.props.pages.length > 1) {
      return (<div style={{ marginLeft: "8px", marginBottom: "10px" }}>
        {
          this.props.pages.map((button, i) => <div key={i} onClick={this.onClick(button)} className={this.calcClass(button)} >{button.text}</div>)
        }
      </div>)
    } else {
      return (<div></div>)
    }
  }
}

export class DeviceList extends Component {

  componentDidMount() {


    // if (this.props.public == true) {
    //   setTimeout(() => {
    //     return (
    //       toast(
    //         <div>
    //           Hey there prototyper😎, we've noticed that you don't have any devices yet. Don't worry though, we've added a dummy device for you to get you started
    //       </div>
    //       )
    //     )
    //   }, 3000)
    // }

    // if (this.props.devices.length == 0) {
    //   setTimeout(() => {
    //     return (
    //       toast(
    //         <div>
    //           Hey there prototyper😎, we've noticed that you don't have any devices yet. Don't worry though, we'll add a dummy device shortly for you to get you started
    //       </div>
    //       )
    //     )
    //   }, 2000)
    // }
  }

  state = {
    activePage: 1
  }

  onPageChange = (data) => {
    this.setState({ activePage: data.text })
  }

  handleActionCall = (a) => {
    return (e) => {
      this.props.actionCall({ a, e })
    }
  }

  handleMapAction = (device, action) => {
    return (e, n) => {
      this.props.mapactionCall({ device, action, e, n })
    }
  }

  render() {

    if (this.props.devices == undefined) {
      return null
    }

    var pagesNum = Math.ceil(this.props.devices.length / this.props.max);


    //if (pagesNum < this.state.activePage) { this.setState({activePage : 1 })}

    var pages = [];
    for (var a = 1; a <= pagesNum; a++) {
      pages.push({ text: a, active: (this.state.activePage == a) });
    }


    if (this.props.devices.length == 0) {
      return (
        <div className="row " style={{ opacity: 0.5 }}>
          <div className="col-12" style={{ padding: "0 5px 0 5px" }}>
            <div className="commanderBgPanel" style={{ margin: 0 }}>
              <center>No devices to display.</center>
              {/* <ToastContainer /> */}
            </div>
          </div>
        </div>
      )
    } else {

      var devicelist = _.clone(this.props.devices);

      if (this.props.max) {
        var start = this.props.max * (this.state.activePage - 1)
        var end = this.props.max * this.state.activePage
        devicelist = devicelist.slice(start, end);
      }

      if (devicelist.length == 0) {
        if (this.state.activePage != 1) {
          this.setState({ activePage: 1 })
        }
      }

      return (
        <div>
          {devicelist.map(device => <StatesViewerItem public={this.props.public} username={this.props.username} view={this.props.view} mapActionCall={this.handleMapAction(device)} actionCall={this.handleActionCall(device.key)} key={device.key} device={device} devID={device.devid} public={this.props.public} account={this.props.account} visiting={this.props.visiting} />)}
          <div style={{ marginLeft: -9 }}> <Pagination pages={pages} className="row" onPageChange={this.onPageChange} /> </div>
        </div>
      )
    }
  }
}

export class StatesViewer extends Component {
  state = {
    search: "",
    sort: "",
    devicesServer: [],
    devicesView: [],
    checkboxstate: "Select All",
    boxtick: "far fa-check-square",
    publicButton: "",
    deleteButton: "",
    shareButton: "",
    selectedDevices: [],
    selectAllState: null,
    view: "map",
    devicePressed: undefined,
    boundary: undefined,
    showB: false
  };

  socket = undefined;
  busyGettingNewDevice = false;

  constructor(props) {
    super(props)
    var un = this.props.username;
    var acc = this.props.account;
    var dc = this.state.devicePressed;
    var ds = this.state.devicesServer;
    this.props.sendProps({ un, acc, dc, ds });

    this.socket = socketio();

    fetch("/api/v3/getsort", {
      method: "GET", headers: { "Accept": "application/json", "Content-Type": "application/json" },
    }).then(response => response.json()).then(serverresponse => {
      if (serverresponse.sort == null || serverresponse.sort == undefined) {
        serverresponse.sort = "";
      }
      this.setState({ sort: serverresponse.sort })
    }).catch(err => console.error(err.toString()));

    this.socket.on("connect", a => {
      this.socket.emit("join", this.props.username)
      this.socket.on("info", (info) => {
        if (info.newdevice) {
          p.statesByUsername(this.props.username, (states) => {
            for (var s in states) {
              states[s].selected = false
            }
            if (this.props.account.level >= 100) {
              fetch("/api/v3/states/usernameToDevice", {
                method: "GET", headers: { "Accept": "application/json", "Content-Type": "application/json" }
              }).then(response => response.json()).then(serverresponse => {
                for (var s in serverresponse) {
                  serverresponse[s].selected = false
                }
                this.setState({ devicesServer: serverresponse }, () => {
                  for (var device in this.state.devicesServer) {
                    this.socket.emit("join", this.state.devicesServer[device].key);
                  }

                  this.setState({ devicesView: serverresponse }, () => {
                    //this.socketConnectDevices();
                    this.sort();
                  })
                })
              }).catch(err => console.error(err.toString()));
            }
            else if (this.props.account.level < 100) {
              this.setState({ devicesServer: states }, () => {

                for (var device in this.state.devicesServer) {
                  this.socket.emit("join", this.state.devicesServer[device].key);
                }
                this.setState({ devicesView: states }, () => {
                  this.sort();
                })
              })
            }
          })
        }
      })

      this.socket.on("post", (packet) => {
        this.handleDevicePacket(packet)
      })

      this.socket.on('boundary', (packet) => {
        this.handleDevicePacket(packet)
      })
    });

    if (this.props.public == true) {
      p.publicStates((states) => {
        for (var s in states) {
          states[s].selected = false
        }

        fetch("/api/v3/states/usernameToDevice", {
          method: "GET", headers: { "Accept": "application/json", "Content-Type": "application/json" }
        }).then(response => response.json()).then(serverresponse => {
          for (var s in serverresponse) {
            serverresponse[s].selected = false
          }
          this.setState({ devicesServer: serverresponse }, () => {
            for (var device in this.state.devicesServer) {
              this.socket.emit("join", this.state.devicesServer[device].key);
            }

            this.setState({ devicesView: serverresponse }, () => {
              this.sort();
            })
          })
        }).catch(err => console.error(err.toString()));
      })
    }
    else {
      p.statesByUsername(this.props.username, (states) => {
        for (var s in states) {
          states[s].selected = false
        }

        if (this.props.account.level >= 100 && this.props.visiting == false || this.props.account.level == 0) {
          fetch("/api/v3/states/usernameToDevice", {
            method: "GET", headers: { "Accept": "application/json", "Content-Type": "application/json" }
          }).then(response => response.json()).then(serverresponse => {
            for (var s in serverresponse) {
              serverresponse[s].selected = false
            }
            this.setState({ devicesServer: serverresponse }, () => {
              for (var device in this.state.devicesServer) {
                this.socket.emit("join", this.state.devicesServer[device].key);
              }
              this.setState({ devicesView: serverresponse }, () => {
                this.sort();
              })
            })
          }).catch(err => console.error(err.toString()));
        } else {
          this.setState({ devicesServer: states }, () => {
            for (var device in this.state.devicesServer) {
              this.socket.emit("join", this.state.devicesServer[device].key);
            }
            this.setState({ devicesView: states }, () => {
              this.sort();
            })
          })
        }

        if (states.length == 0) {
          var url = window.location.origin + "/api/v3/data/post";
          setTimeout(() => {
            fetch(url, {
              method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
              body: JSON.stringify({
                "id": "Dummy_Device",
                "data": {
                  "temperature": 24.54,
                  "doorOpen": false,
                  "gps": {
                    "lat": 25.123,
                    "lon": 28.125
                  }
                }
              })
            }).then(response => response.json()).then(resp => {
            }).catch(err => console.error(err.toString()));
          }, 13000)
        }
      })
    }
  }

  getNewDevice = () => {
    if (this.busyGettingNewDevice == true) {
      console.log("already busy.. please wait")
    } else {
      console.log("getting new device(s)")
      p.statesByUsername(this.props.username, (states) => {
        console.log(states);
      });
    }
  }

  componentWillUnmount = () => {
    this.socket.disconnect();
  }

  componentDidUpdate = () => {
    var un = this.props.username;
    var acc = this.props.account;
    var dc = this.state.devicePressed;
    var ds = this.state.devicesServer;
    this.props.sendProps({ un, acc, dc, ds })
    var data = Buffer.from(JSON.stringify({ wifi: { ssid: "devprotowifi", pass: "devprotowifi" } }))
  }

  handleDevicePacket = (packet) => {
    var devices = _.clone(this.state.devicesServer)
    var found = 0;
    for (var dev in devices) {
      // if (devices[dev].devid == packet.devid && packet.notification24) {
      //   devices[dev]["notification24"] = packet.notification24;
      // }

      if (devices[dev].devid == packet.id) {
        found = 1;
        devices[dev]["_last_seen"] = packet.timestamp;
        devices[dev].payload = _.merge(devices[dev].payload, packet)
      } else if (devices[dev].devid == packet.devid) {
        if (packet.boundaryLayer != undefined) {
          found = 1;
          devices[dev]["_last_seen"] = packet._last_seen;
          devices[dev].payload.timestamp = packet._last_seen;
          devices[dev].boundaryLayer = packet.boundaryLayer;
        } else {
          found = 1;
          devices[dev]["_last_seen"] = packet._last_seen;
          devices[dev].payload.timestamp = packet._last_seen;
          packet.selectedIcon = true;
          devices[dev] = _.merge(devices[dev].boundaryLayer, packet);
        }
      }
    }

    if (found == 0) {
      console.log("recieved data for device not on our list yet.")
    } else {
      // update
      if (this.state.search.length > 0) {
        this.setState({ devicesServer: devices })
      } else {
        this.setState({ devicesServer: devices })
        this.setState({ devicesView: devices }, () => {
        })
        this.sort();
      }
    }
  }

  // updateDeviceList = () => {
  //   var loadList = _.clone(this.state.devicesView);

  //   this.setState({ devicesServer: loadList })
  //   this.setState({ devicesView: loadList }, () => {
  //     this.sort()
  //   })    

  // }

  search = evt => {
    this.setState({ search: evt.target.value.toString() }, () => {
      var newDeviceList = []
      for (var device of this.state.devicesServer) {
        if (this.state.search.length > 0) {
          if (device.devid.toString().toLowerCase().includes(this.state.search.toLowerCase()) || device.meta.user.email.toString().toLowerCase().includes(this.state.search.toLowerCase())) {
            newDeviceList.push(device)
          }
        } else {
          newDeviceList.push(device)
        }
      }
      //end filter
      this.setState({ devicesView: newDeviceList }, this.selectCountUpdate)
    })
  }

  sort = (sorttype) => {
    var value;
    if (sorttype != undefined) {
      value = sorttype;
      this.setState({ sort: value })
    } else {
      value = this.state.sort;
    }

    var newDeviceList = _.clone(this.state.devicesView)

    if (value == "timedesc") {
      newDeviceList.sort((a, b) => {
        if (new Date(a["_last_seen"]) > new Date(b["_last_seen"])) {
          return 1
        } else {
          return -1
        }
      }).reverse();
    }

    if (value == "namedesc") {
      newDeviceList.sort((a, b) => {
        if (a.devid >= b.devid) {
          return 1
        } else { return -1 }
      })
    }

    if (value == "") {
      newDeviceList.sort((a, b) => {
        if (new Date(a["_created_on"]) > new Date(b["_created_on"])) {
          return 1
        } else {
          return -1
        }
      }).reverse();
    }

    this.setState({ devicesView: newDeviceList }, this.selectCountUpdate);
    this.setState({ sort: value });

    fetch("/api/v3/sort", {
      method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ sort: value })
    }).then(response => response.json()).then(serverresponse => {
    }).catch(err => console.error(err.toString()));
  }

  selectCountUpdate = () => {
    var selectCount = 0;
    for (var dev in this.state.devicesView) {
      if (this.state.devicesView[dev].selected) {
        selectCount++;
      }
    }
    this.setState({ selectCount: selectCount })
  }

  selectAll = (value) => {
    var newDeviceList = _.clone(this.state.devicesView)

    if (value == true) {
      for (var dev in newDeviceList) {
        newDeviceList[dev].selected = true;
        this.state.selectedDevices.push(newDeviceList[dev].devid);
      }
      this.setState({ devicesView: newDeviceList }, this.selectCountUpdate)
      this.setState({ selectAllState: true });
    } else if (value == false) {
      for (var dev in newDeviceList) {
        newDeviceList[dev].selected = false;
        this.state.selectedDevices.pop(newDeviceList[dev].devid);
      }
      this.setState({ devicesView: newDeviceList }, this.selectCountUpdate)
      this.setState({ selectAllState: false });
    }
  }

  handleActionCall = (clickdata) => {
    var newDeviceList = _.clone(this.state.devicesView)

    for (var dev in newDeviceList) {
      if (newDeviceList[dev].key == clickdata.a) {
        if (clickdata.e == "deselect") {
          if (this.state.selectAllState === true) {
            this.setState({ selectAllState: false });
          }
          newDeviceList[dev].selected = false;
        }
        if (clickdata.e == "select") {
          newDeviceList[dev].selected = true;
        }
      }
    }
    this.setState({ devicesView: newDeviceList }, this.selectCountUpdate);
  }

  deviceClicked = (device) => {
    var newDeviceList = _.clone(this.state.devicesView)

    this.showBoundaryPath(false);

    for (var devices in newDeviceList) {
      if (newDeviceList[devices].selectedIcon == true) {
        newDeviceList[devices].selectedIcon = false;
      }
    }

    for (var dev in newDeviceList) {
      if (newDeviceList[dev].key == device.e.key) {
        if (!device.n) {
          newDeviceList[dev].selectedIcon = false;
        } else if (device.n && newDeviceList[dev].boundaryLayer == undefined) {
          newDeviceList[dev].selectedIcon = true;
        } else if (device.n && newDeviceList[dev].boundaryLayer != undefined) {
          newDeviceList[dev].selectedIcon = true;
        }
      }
    }

    this.setState({ devicesView: newDeviceList });
    this.setState({ devicePressed: device.device });
    this.setState({ boundary: device.n });
  }

  deleteSelectedDevices = () => {
    var devicesToDelete = this.state.devicesServer.filter((device) => { return device.selected == true; })

    for (var dev in devicesToDelete) {
      if (devicesToDelete[dev].selected === true) {
        fetch("/api/v3/state/delete", {
          method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ id: devicesToDelete[dev].devid, key: devicesToDelete[dev].key })
        }).then(response => response.json()).then(serverresponse => {
        }).catch(err => console.error(err.toString()));
      }
    }
    // -------------------------------
    var devicesServerTemp = this.state.devicesServer.filter((device) => { return device.selected == false; })
    var devicesViewTemp = this.state.devicesView.filter((device) => { return device.selected == false; })
    this.setState({ devicesView: devicesViewTemp, devicesServer: devicesServerTemp }, this.selectCountUpdate)
  }

  changeView = (action) => {
    this.setState({ view: action })
  }

  showBoundaryPath = (action) => {
    this.setState({ showB: action })
  }

  returnDeviceList = () => {
    return (
      <Media query="(max-width: 599px)">
        {matches => {
          var num;
          matches ? (
            num = 10
          ) : (
              num = 14
            )
          return (
            <div >
              <DeviceList username={this.props.username} devices={this.state.devicesView} view={this.state.view} max={num} mapactionCall={this.deviceClicked} actionCall={this.handleActionCall} public={this.props.public} account={this.props.account} visiting={this.props.visiting} />
            </div>
          )
        }
        }
      </Media>
    )
  }

  render() {
    if (this.state.deleted == true) {
      return (<div style={{ display: "none" }}></div>);
    } else {
      if (this.state.view == "list") {
        return (
          <div style={{ paddingTop: 25, margin: 30 }} >
            {/* <span>username: {this.props.username}</span> */}
            <StatesViewerMenu search={this.search} selectAll={this.selectAll} devices={this.state.devicesView} public={this.props.public} sort={this.sort} view={this.changeView} selectCount={this.state.selectCount} deleteSelected={this.deleteSelectedDevices} visiting={this.props.visiting} />
            <div className="rowList2">
              {this.returnDeviceList()}
            </div>
          </div>
        )
      } else if (this.state.view == "map") {
        return (
          <div style={{ paddingTop: 25, margin: 30 }} >
            <StatesViewerMenu deviceCall={this.state.devicePressed} boundary={this.state.boundary} public={this.props.public} acc={this.props.account} search={this.search} selectAll={this.selectAll} devices={this.state.devicesView} sort={this.sort} view={this.changeView} selectCount={this.state.selectCount} deleteSelected={this.deleteSelectedDevices} visiting={this.props.visiting} />
            <div className="rowList">
              {this.returnDeviceList()}
              <div className="mapContainer">
                <MapDevices public={this.props.public} widget={false} showBoundary={this.state.showB} username={this.props.username} acc={this.props.account} deviceCall={this.state.devicePressed} devices={this.state.devicesServer} PopUpLink={true} visiting={this.props.visiting} />
              </div>
            </div>
          </div>
        )
      }
    }
  }
}
