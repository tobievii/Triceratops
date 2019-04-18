import React, { Component } from "react";

export class TeltonikaConfigure extends React.Component {
  state = {
    form: {
      port: ""
    }
  }

  changeInput = name => {
    return evt => {
      var form = { ...this.state.form };
      form[name] = evt.target.value;
      this.setState({ form });
    };
  };

  enable = () => {
    if (this.props.enable) {
      this.props.enable();
    }
  }

  enableButton = () => {
    if (this.props.port) {
      return (<div className="commanderBgPanel" style={{ float: "left" }}
      > <i className="fas fa-check-circle" style={{ color: "#11cc88" }}></i> PORT IS ACTIVE: {this.props.port} </div>)
    } else {
      return (<div className="commanderBgPanel commanderBgPanelClickable"
        style={{ float: "left" }}
        onClick={this.enable}>
        <i className="fas fa-play-circle" style={{ color: "#11cc88" }}></i> ENABLE</div>)
    }

  }

  render() {
    return (
      <div className="blockstyle">
        <h4>PRIVATE PORT</h4>
        <p>A private port for Teltonika devices will bind a server port to your account so all devices pointed to this port will automatically be added to your account.</p>
        {this.enableButton()}
        <div style={{ clear: "both" }}></div>
      </div>
    )
  }

}