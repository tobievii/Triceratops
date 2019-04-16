import React, { Component } from "react";

import { AddRoute } from "./pluginHTTP_add.jsx";
import { PortList } from "./pluginHTTP_list.jsx";

import socketio from 'socket.io-client';
const socket = socketio();

export const name = "HTTP";

export class SettingsPanel extends React.Component {
  state = { routes: [], user: {} };

  getaccount = () => {
    fetch("/api/v3/account", { method: "GET" })
      .then(res => res.json())
      .then(user => {
        this.setState({ user });
      })
      .catch(err => console.error(err.toString()));
  };

  addroute = (form, cb) => {
    console.log(form);
    fetch("/api/v3/http/addroute", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    }).then(response => response.json())
      .then((data) => {
        if (data.err) {
          cb(data.err, undefined)
        } else {
          cb(undefined, data);
        }
        this.getroutes();
      })
      .catch(err => console.error(err.toString()));
  };

  getroutes = () => {
    fetch("/api/v3/http/routes", { method: "GET" })
      .then(res => res.json())
      .then(routes => {
        this.setState({ routes });
      })
      .catch(err => console.error(err.toString()));
  };

  componentDidMount = () => {
    this.getaccount();
    this.getroutes();

    socket.on("plugin", (data) => {
      console.log(data);
      this.getroutes();
    })
  };

  update = () => {
    this.getaccount();
    this.getroutes();
  }

  render() {
    return (
      <div>
        <AddRoute formSubmit={this.addroute} />
        <PortList list={this.state.routes} update={this.update} />
      </div>
    );
  }
}
