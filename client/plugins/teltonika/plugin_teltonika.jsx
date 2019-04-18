import React, { Component } from "react";

import { TeltonikaConfigure } from "./plugin_teltonika_add.jsx"

export const name = "Teltonika";

export class SettingsPanel extends React.Component {

  state = {
    teltonikaServiceEnabled: false,
    port: undefined
  }

  componentWillMount = () => {
    this.updateFromServer();
  }

  updateFromServer = () => {
    fetch("/api/v3/teltonika/info")
      .then(res => res.json())
      .then((result) => {
        console.log(result);
        if (result.port) {
          console.log(result.port);
          this.setState({ port: result.port })
        }
      }).catch((err) => {
        console.log(err);
      })
  }

  enable = () => {
    fetch("/api/v3/teltonika/reqport")
      .then(res => res.json())
      .then((result) => {
        console.log(result);
        if (result.port) {
          this.setState({ port: result.port });
        }
      }).catch((err) => {
        console.log(err);
      })

    //this.setState({ teltonikaServiceEnabled: true })
  }

  render() {
    return (
      <div className="blockstyle">
        <h4>TELTONIKA</h4>

        <div className="blockstyle" style={{ marginBottom: 20, display: "none" }}>
          <h4>PUBLIC PORT</h4>
          DEFAULT PORT: 12000
          <p>If you set Teltonika device to connect to this port devices will be visible to administrators only.
            Any user can type in IMEI to add device to their account.</p>
        </div>

        <TeltonikaConfigure enable={this.enable} port={this.state.port} />
      </div>
    );
  }
}
