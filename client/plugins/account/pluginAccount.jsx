import React, { Component } from "react";

import { SetUsername } from "./pluginAccount_username.jsx"

export const name = "Account"

export class SettingsPanel extends React.Component {
  state = {
    account: {},
    level: 0
  }
  componentDidMount() {
    this.getAccount();
  }

  getAccount = () => {
    fetch("/api/v3/account", { method: "GET" }).then(resp => resp.json()).then((data) => {
      if (data.level) {
        this.setState({ level: data.level })
      }
      this.setState({ account: data })
    })
  }

  usernameUpdated = () => {
    this.getAccount();
  }

  render() {
    return (
      <div>
        <div className="adminBlocks" >
          <a href="/signout"><button className="btn-spot" style={{ float: "right" }} > SIGN OUT</button></a>
          <h4>ACCOUNT</h4>
          email:<span className="settingsDetails"> {this.state.account.email}</span><br />
          level:<span className="settingsDetails"> {this.state.account.level}</span><br />
          username:<span className="settingsDetails"> {this.state.account.username}</span><br />

          <SetUsername username={this.state.account.username} usernameUpdated={this.usernameUpdated} />
          <div style={{ clear: "both" }} />

        </div>

      </div>
    )
  }
}


