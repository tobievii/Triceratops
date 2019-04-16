import React, { Component } from "react";
import { Link } from "react-router-dom";
import moment from 'moment'
import { confirmAlert } from 'react-confirm-alert';
import { ShareList } from './ShareList.jsx'

export class StatesViewerItem extends Component {
  state = {
    timeago: "",
    timestamp: "",
    millisago: 0,
    deleted: false,
    publicButtonState: "PUBLIC",
    deleteButtonClick: 0,
    selected: undefined,
    active: false,
    lastTimestamp: undefined,
    mapIcon: <i className="fas fa-map-marker-alt marker" title="Go To Device"></i>,
    device: undefined,
    deviceShare: undefined,
    opacityp: "1",
    opacity: "1",
    opacityw: "1",
    opacitya: "1",
    isOpen: false,
    User: "",
    warningNotification: "",
    alarmNotification: ""
  };

  intervalUpdator = undefined;

  constructor(props) {
    super(props)
  }

  componentWillMount = () => {
    // console.log("mounted " + this.props.device.devid)

    this.intervalUpdator = setInterval(() => {
      this.updateTime();
    }, 1000 / 10)
    if (this.props.account.level < 100 && this.props.account.level > 0) {
      this.setState({ User: this.props.username })
    }
    else if (this.props.account.level >= 100 && this.props.visiting == false || this.props.account.level == 0) {
      this.setState({ User: this.props.device.fromUsers.username })

    }
    else if (this.props.account.level >= 100 && this.props.visiting == true) {
      this.setState({ User: this.props.username })
    }

    this.setState({ device: this.props.device }, () => this.setDevice(this.props.device))
  }

  componentDidUpdate = () => {
    //console.log("update "+this.props.device.devid)
  }

  setDevice = (device) => {
    if (device.public != undefined) {
      if (device.public == true) {
        this.setState({ opacityp: "1" })
      } else {
        this.setState({ opacityp: "0.2" })
      }
    } else {
      this.setState({ opacityp: "0.2" })
    }

    if (device.access != undefined) {
      if (device.access.length > 0) {
        this.setState({ opacity: "1" })
      } else {
        this.setState({ opacity: "0.2" })
      }
    } else {
      this.setState({ opacity: "0.2" })
    }

    if (device.boundaryLayer != undefined || device.boundaryLayer != null) {
      if (device.boundaryLayer.inbound != true) {
        this.setState({ opacitya: "1" })
      } else {
        this.setState({ opacitya: "0.2" })
      }
    } else {
      this.setState({ opacitya: "0.2" })
    }

    if (device.notification24 != undefined) {
      this.setState({ opacityw: "1" })
    } else {
      this.setState({ warningNotification: { type: "Device has no warnings" } });
      this.setState({ opacityw: "0.2" })
    }

    var notifications = this.props.account.notifications;
    for (var s in notifications) {
      if (notifications[s].type == "CONNECTION DOWN 24HR WARNING" && device.devid == notifications[s].device && notifications[s].seen == false) {
        this.setState({ warningNotification: notifications[s] });
      }

      if (notifications[s].type == "ALARM" && device.devid == notifications[s].device && notifications[s].seen == false) {
        this.setState({ opacitya: "1" })
        this.setState({ alarmNotification: notifications[s] });
      }
    }
  }

  componentWillUnmount = () => {
    clearInterval(this.intervalUpdator)
  }

  updateTime = () => {
    if (this.props.device["_last_seen"]) {
      var lastChange = new Date(this.props.device["_last_seen"]);
      var millisago = Date.now() - lastChange.getTime();
      var timeago = moment(this.props.device["_last_seen"]).fromNow()
      this.setState({ timeago, millisago })
    }
  }

  blendrgba(x, y, ratio) {

    if (ratio <= 0) {
      return "rgba(" + Math.round(x.r) + "," + Math.round(x.g) + "," + Math.round(x.b) + "," + x.a + ")"
    } else if (ratio >= 1) {
      return "rgba(" + Math.round(y.r) + "," + Math.round(y.g) + "," + Math.round(y.b) + "," + y.a + ")"
    } else {
      var blended = {
        r: (x.r * (1 - ratio)) + (y.r * ratio),
        g: (x.g * (1 - ratio)) + (y.g * ratio),
        b: (x.b * (1 - ratio)) + (y.b * ratio),
        a: (x.a * (1 - ratio)) + (y.a * ratio),
      }
      return "rgba(" + Math.round(blended.r) + "," + Math.round(blended.g) + "," + Math.round(blended.b) + "," + blended.a + ")"
    }

    //return "rgba(255,255,255,1)"
  }

  calcStyle = () => {
    var timefade = 3000;

    var lastChange = new Date(this.props.device["_last_seen"]);
    var millisago = Date.now() - lastChange.getTime();
    var ratio = (timefade - millisago) / timefade;

    //var ratio = (timefade-this.state.millisago)/timefade;
    if (ratio < 0) { ratio = 0 }
    if (ratio > 1) { ratio = 1 }

    if (this.props.device.selected) {
      return {
        marginBottom: 2, padding: "0px",
        backgroundImage: "linear-gradient(to right, rgb(94, 37, 45), " + this.blendrgba({ r: 3, g: 4, b: 5, a: 0.5 }, { r: 125, g: 255, b: 175, a: 0.75 }, (ratio / 1.5) - 0.35) + ")",
        borderRight: "2px solid " + this.blendrgba({ r: 60, g: 19, b: 25, a: 0 }, { r: 125, g: 255, b: 175, a: 1.0 }, ratio),
        borderLeft: "2px solid rgb(255, 57, 67)"
      }
    } else {
      return {
        marginBottom: 2, padding: "0px",
        backgroundImage: "linear-gradient(to right, rgba(3, 4, 5, 0.5)," + this.blendrgba({ r: 3, g: 4, b: 5, a: 0.5 }, { r: 125, g: 255, b: 175, a: 0.75 }, (ratio / 1.5) - 0.35) + ")",
        borderRight: "2px solid " + this.blendrgba({ r: 60, g: 19, b: 25, a: 0 }, { r: 125, g: 255, b: 175, a: 1.0 }, ratio)
      }
    }
  }

  descIfExists = () => {
    if (this.props.device.desc) {
      return <span style={{ color: "rgba(125,255,175,0.5)" }}>{this.props.item.desc}</span>
    } else {
      return <span></span>
    }
  }

  deleteEntry = (id) => {
    fetch("/api/v3/state/delete", {
      method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ id: id })
    }).then(response => response.json()).then(serverresponse => {
      console.log(serverresponse);
      this.setState({ deleted: true })
    }).catch(err => console.error(err.toString()));
  }

  dialog() {
    if (this.state.dialog) {
      return (
        <div className="container" style={{ color: "red" }}>
        </div>
      );
    }
  }

  goToDevice = (id) => {
    return (e) => {
      window.location = '/view/' + id;
    }
  }

  confirmation = (device) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='protoPopup' align="center">
            <h1>Are you sure?</h1>
            <p>This will make device visible to Anyone even unregistered vistors </p>
            <div>
              <button className="smallButton" style={{ margin: "5px" }} onClick={onClose}>
                No, Cancel it!
              </button>

              <button className="smallButton" style={{ margin: "5px" }} style={{ margin: "15px" }} onClick={() => {
                {
                  fetch("/api/v3/makedevPublic", {
                    method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
                    body: JSON.stringify({
                      devid: device.key
                    })
                  }).then(response => response.json()).then(serverresponse => {
                    device.public = true;
                    this.setState({ device: device })
                    this.setDevice(device)
                    { onClose() }
                  }).catch(err => console.error(err.toString()));
                }
              }}>Yes,Share Publicly!</button>
            </div>
          </div>
        )
      }
    })
  }

  publicShare = (device) => {
    if (this.props.account.email == this.props.device.meta.user.email) {
      if (device.public != undefined || device.public != null) {
        if (device.public == true) {
          fetch("/api/v3/makedevPrivate", {
            method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({
              devid: device.key
            })
          }).then(response => response.json()).then(serverresponse => {
            if (serverresponse.nModified == 1) {
              device.public = false;
              this.setState({ device: device })
              this.setDevice(device)
            }
          }).catch(err => console.error(err.toString()));
        } else {
          this.confirmation(device);
        }
      } else {
        this.confirmation(device);
      }
    }
  }

  clickShare = (response) => {
    this.setState({ isOpen: false })
    if (response.mail != undefined && response.mail == "sent") {
      fetch("/api/v3/state", {
        method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ id: this.props.device.devid, username: this.props.username })
      }).then(response => response.json()).then(state => {
        this.setState({ device: state })
        this.setDevice(state)
      }).catch(err => console.error(err.toString()));
    }
  }

  selectBoxClickHandler = (action) => {
    return (e) => {
      this.props.actionCall(action)
    }
  }

  adjustMapView = (device) => {
    var action;
    if (device.selectedIcon) {
      action = false;
    } else {
      action = true;
    }
    return (e, n) => {
      this.props.mapActionCall(device, action);
    }
  }

  displayDeviceInfo = () => {
    if (this.props.account.level >= 100 && this.props.device.meta.user.email == this.props.account.email) {
      return (
        <Link className="col" to={"/u/" + this.state.User + "/view/" + this.props.device.devid} title="View Device Data">
          <div style={{ overflow: "hidden", marginTop: "5px" }} onClick={this.adjustMapView(this.props.device)}>
            <span style={{ color: "#fff" }}> {this.props.device.devid} </span> <span style={{ color: "red" }}>*</span>{this.descIfExists()}<br />
          </div>
        </Link>
      )
    }
    else {

      return (
        <Link className="col" to={"/u/" + this.state.User + "/view/" + this.props.device.devid} title="View Device Data">
          <div style={{ overflow: "hidden", marginTop: "5px" }} onClick={this.adjustMapView(this.props.device)}>
            <span style={{ color: "#fff" }}> {this.props.device.devid} </span> {this.descIfExists()}<br />
          </div>
        </Link>
      )
    }
  }

  selectbox = () => {
    if (this.props.public == false) {
      if (this.props.visiting == false) {
        if (this.props.device.selected) {

          return (
            <div className="col" style={{ flex: "0 0 25px", padding: 0, cursor: "pointer" }} onClick={this.selectBoxClickHandler("deselect")} >
              <i className="statesViewerCheckBoxes fas fa-check" style={{ color: "rgb(250, 69, 72)", filter: "drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.35))" }}></i>
            </div>
          )
        } else {
          return (
            <div className="col statesViewerCheckBoxDiv" style={{ flex: "0 0 25px", padding: 0, cursor: "pointer" }} onClick={this.selectBoxClickHandler("select")} >
              <i className="statesViewerCheckBoxes fas fa-check" ></i>
            </div>
          )
        }
      }
    }
  }

  mapIcon = (viewUsed) => {
    if (viewUsed == "map") {
      if (!this.props.device.selectedIcon) {
        return (
          <span align="right" style={{ marginTop: "7px", fontSize: 14, paddingRight: "7px" }} onClick={this.adjustMapView(this.props.device)}>
            <i className="fas fa-map-marker-alt marker" title="Go To Device"></i>
          </span>
        )
      } else {
        return (
          <span align="right" style={{ marginTop: "7px", fontSize: 14, paddingRight: "7px" }} onClick={this.adjustMapView(this.props.device)}>
            <i style={{ color: "red" }} className="fas fa-map-marker-alt marker" title="Go To Device"></i>
          </span>
        )
      }
    } else if (viewUsed == "list") {
      return (
        <span style={{ display: "none" }}></span>
      )
    }
  }

  notifications = (icon, device) => {
    if (this.props.account.level > 0 && device.notification24) {
      return (
        <Link style={{ position: "right" }} to="/notifications" className="navLink" title="Notifications">
          <span className={icon}><i title={this.state.warningNotification.type} className="fas fa-exclamation-triangle" style={{ color: "yellow", opacity: this.state.opacityw, paddingRight: "7px" }}></i></span>
        </Link>
      )
    } else {
      return (
        <span className={icon}><i title={this.state.warningNotification.type} className="fas fa-exclamation-triangle" style={{ color: "yellow", opacity: this.state.opacityw, paddingRight: "7px" }}></i></span>
      )
    }
  }
  adminDevices = () => {
    if (this.props.account.level >= 100 && this.props.device.meta.user.email == this.props.account.email) {
      return (
        <span style={{ color: "red" }}>*</span>
      )
    }
    else {
      return (
        <span ></span>
      )
    }
  }

  toggleModal = () => {
    if (this.props.account.email == this.props.device.meta.user.email) {
      this.setState({ isOpen: !this.state.isOpen })
    }
    else if (this.props.account.email == this.props.device.meta.user.email) {
      this.setState({ isOpen: !this.state.isOpen })
    }
  }

  stateListIcons = (viewUsed, device) => {
    var icon = "";
    var columSize = "";

    if (viewUsed == "map") {
      icon = "iconSmall";
      columSize = "110px"
    } else if (viewUsed == "list") {
      icon = "icon";
      columSize = "200px"
    }
    if (this.props.public == false) {
      if (this.props.visiting == true) {
        return (
          <div className="col dataPreview" style={{ flex: "0 0 " + columSize, textAlign: "right", padding: "6px 3px 5px 0px" }}>
            <span className={icon}><i className="fas fa-bullhorn" style={{ color: "red", opacity: this.state.opacitya, paddingRight: "7px", pointerEvents: "none" }}></i></span>
            <span className={icon}><i title={this.state.warningNotification.type} className="fas fa-exclamation-triangle" style={{ color: "yellow", opacity: this.state.opacityw, paddingRight: "7px", pointerEvents: "none" }}></i></span>
            <span className={"share " + icon}><i className="fas fa-share-alt" style={{ color: "green", paddingRight: "7px", opacity: this.state.opacity, cursor: "not-allowed", pointerEvents: "none" }}></i></span>
            <span className={"visibility " + icon}><i className="fas fa-globe-africa" style={{ color: "#42adf4", paddingRight: "7px", opacity: this.state.opacityp, cursor: "not-allowed", pointerEvents: "none" }}></i></span>
            {this.mapIcon(viewUsed)}
          </div>
        )
      }
      else {

        return (
          <div className="col dataPreview" style={{ flex: "0 0 " + columSize, textAlign: "right", padding: "6px 3px 5px 0px" }}>
            <span className={icon}><i className="fas fa-bullhorn" style={{ color: "red", opacity: this.state.opacitya, paddingRight: "7px" }}></i></span>
            {this.notifications(icon, device)}
            <span className={"share " + icon}><i onClick={this.toggleModal} className="fas fa-share-alt" style={{ color: "green", paddingRight: "7px", opacity: this.state.opacity }}></i></span>
            <span className={"visibility " + icon}><i onClick={() => this.publicShare(device)} className="fas fa-globe-africa" style={{ color: "#42adf4", paddingRight: "7px", opacity: this.state.opacityp }}></i></span>
            {this.mapIcon(viewUsed)}
          </div>
        )
      }
    }

    else if (this.props.public == true) {
      return (
        <div className="col dataPreview" style={{ flex: "0 0 " + columSize, textAlign: "right", padding: "6px 3px 5px 0px" }}>
          <span className={icon}><i className="fas fa-bullhorn" style={{ color: "red", opacity: this.state.opacitya, paddingRight: "7px", pointerEvents: "none" }}></i></span>
          <span className={icon}><i title={this.state.warningNotification.type} className="fas fa-exclamation-triangle" style={{ color: "yellow", opacity: this.state.opacityw, paddingRight: "7px", pointerEvents: "none" }}></i></span>
          <span className={"share " + icon}><i className="fas fa-share-alt" style={{ color: "green", paddingRight: "7px", opacity: this.state.opacity, cursor: "not-allowed", pointerEvents: "none" }}></i></span>
          <span className={"visibility " + icon}><i className="fas fa-globe-africa" style={{ color: "#42adf4", paddingRight: "7px", opacity: this.state.opacityp, cursor: "not-allowed", pointerEvents: "none" }}></i></span>
          {this.mapIcon(viewUsed)}
        </div>
      )
    }
  }

  render() {
    if (this.props.device == undefined) {
      return (<div></div>)
    }

    if (this.state.deleted == true) {
      return (<div style={{ display: "none" }}></div>);
    } else {
      var dataPreview = JSON.stringify(this.props.device.payload.data)
      var maxlength = 120;
      if (dataPreview.length > maxlength) { dataPreview = dataPreview.slice(0, maxlength) + "..." }
      var viewUsed = this.props.view
      var qr = { mail: "failedq" }
      if (viewUsed == "list") {

        return (
          <div className="container-fluid" style={{ marginBottom: 2 }}>
            <div className="row statesViewerItem" style={this.calcStyle()} >

              {this.selectbox()}

              <Link className="col" to={"/u/" + this.state.User + "/view/" + this.props.device.devid} style={{ overflow: "hidden" }}>
                <div>
                  <span style={{ color: "#fff" }}> {this.props.device.devid}</span> {this.adminDevices()}  {this.descIfExists()}<br />
                  <span className="faded dataPreview" style={{ fontSize: 12, color: "rgba(225,255,225,0.5)" }} >{dataPreview}</span>
                </div>
              </Link>

              <div className="col changeTimeagoWidth" style={{ flex: "0 0 230px", textAlign: "right" }}>
                <span style={{ fontSize: 12 }}>{this.state.timeago}</span><br />
                <span className="faded dataPreview" style={{ fontSize: 12 }}>{this.props.device["_last_seen"]}</span>
              </div>
              <div style={{ paddingTop: "7px" }}>
                {this.stateListIcons(viewUsed, this.props.device)}
              </div>

              <ShareList devid={this.props.devID} isOpen={this.state.isOpen} username={this.props.username} account={this.props.account} closeModel={this.clickShare} />

            </div>
          </div>
        );
      } else if (viewUsed == "map") {
        return (
          <div className="container-fluid" style={{ marginBottom: 2 }}>
            <div className="row statesViewerItemMap" style={this.calcStyle()} >

              {this.selectbox()}
              {this.displayDeviceInfo()}

              <div className="col" align="right" style={{ marginTop: "4px" }}>
                <span style={{ fontSize: 12, color: "#fff" }}>{this.state.timeago}</span>
              </div>

              {/* <div className="col" style={{ flex: "0 0 40px", textAlign: "right" }}> */}
              {this.stateListIcons(viewUsed, this.state.device)}
              {/* {this.mapIcon()}
              </div> */}
              <ShareList devid={this.props.devID} isOpen={this.state.isOpen} username={this.props.username} account={this.props.account} closeModel={this.clickShare} />
            </div>
          </div>
        )
      }
    }
  }
}
