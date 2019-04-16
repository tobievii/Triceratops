import React, { Component } from "react";

import { Registration } from "./registration.jsx"

export const name = "Admin"

export class SettingsPanel extends React.Component {
  state = {
    account: {},
    level: 0
  }
  componentDidMount() {
    fetch("/api/v3/account", { method: "GET" }).then(resp => resp.json()).then((data) => {
      //console.log(data);
      if (data.level) {
        this.setState({ level: data.level })
      }
      this.setState({ account: data })
    })
  }



  render() {
    return (
      <div>
        <div className="adminBlocks" >
          <h4>ADMIN</h4>
          level: {this.state.account.level}<br />
          <div style={{ clear: "both" }} />
        </div>

        <Registration level={this.state.level} />
        
      </div>
    )
  }
}


