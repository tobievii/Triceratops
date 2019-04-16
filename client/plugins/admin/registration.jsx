import React, { Component } from "react";

export class Registration extends React.Component {
  state = {
    userRegistration: false,
    userEmailVerify: false,
    nodeMailerTransportHost: "",
    nodeMailerTransportPort: "",
    nodeMailerTransportAuthUser: "",
    nodeMailerTransportAuthPass: "",
    nodeMailerTransportFrom: ""
  }

  componentDidMount = () => {
    fetch("/api/v3/admin/registration", { method: "GET", headers: { "Accept": "application/json", "Content-Type": "application/json" } }).then(response => response.json()).then(data => {
      // console.log(data);  
      if (data.err) { }
      if (data.result) {
        this.setState(data.result)
      }
    }).catch(err => console.error(err.toString()));
  }

  checkBox = (flag) => {
    return evt => {
      var newState = {}
      newState[flag] = !this.state[flag]
      this.setState(newState);
    }
  }

  handleFormChange = id => {
    return evt => {
      var newsetting = {}
      newsetting[id] = evt.target.value
      this.setState(newsetting)
    }
  }

  updateOptions = () => {
    console.log(this.state)


    fetch("/api/v3/admin/registration", {
      method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(this.state)
    }).then(response => response.json()).then(data => {
      console.log(data);

    }).catch(err => console.error(err.toString()));



  }

  setupNodemailer = () => {
    if (this.state.userEmailVerify) {
      return (<div className="adminBlocksSub">

        <FormInput label="host" value={this.state.nodeMailerTransportHost} onChange={this.handleFormChange("nodeMailerTransportHost")} />
        <FormInput label="port" value={this.state.nodeMailerTransportPort} onChange={this.handleFormChange("nodeMailerTransportPort")} />
        <FormInput label="auth user" value={this.state.nodeMailerTransportAuthUser} onChange={this.handleFormChange("nodeMailerTransportAuthUser")} />
        <FormInput label="auth pass" value={this.state.nodeMailerTransportAuthPass} onChange={this.handleFormChange("nodeMailerTransportAuthPass")} />
        <FormInput label="from" value={this.state.nodeMailerTransportFrom} onChange={this.handleFormChange("nodeMailerTransportFrom")} />


        <div style={{ clear: "both" }} />
      </div>)
    } else {
      return null;
    }

  }

  render() {
    if (this.props.level >= 100) {
      return (
        <div className="adminBlocks" >
          <div><h4>REGISTRATION</h4></div>

          <div><input className="medium-checkbox" type="checkbox"
            checked={this.state.userRegistration}
            onChange={this.checkBox("userRegistration")} /> Enable public user registration</div>

          <div><input className="medium-checkbox" type="checkbox"
            checked={this.state.userEmailVerify}
            onChange={this.checkBox("userEmailVerify")} /> Require email verification</div>

          {this.setupNodemailer()}

          <button className="btn-spot" style={{ float: "right", marginTop: 10 }} onClick={this.updateOptions} >APPLY</button>

          <div style={{ clear: "both" }} />
        </div>
      )
    } else {
      return null;
    }
  }

}


export class FormInput extends React.Component {
  render() {
    return (
      <div className="row" style={{ marginBottom: 3 }}>
        <div className="col-3" style={{ textAlign: "right", paddingTop: 10 }}  >{this.props.label}:</div>
        <div className="col-9">
          <input style={{ width: "100%" }} value={this.props.value} spellCheck="false" onChange={this.props.onChange} />
        </div>
      </div>
    )
  }
}
