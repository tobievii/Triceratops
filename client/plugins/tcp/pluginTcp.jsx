import React, { Component } from "react";

import { AddPort } from "./pluginTcp_addPort.jsx";
import { PortList } from "./pluginTcp_portList.jsx";

import socketio from 'socket.io-client';
const  socket = socketio();

export const name = "TCP";

export class SettingsPanel extends React.Component {
  state = { ports : [], user : {} };

  getAccount = () => {
    fetch("/api/v3/account", { method: "GET" })
      .then(res => res.json())
      .then(user => {
        this.setState({ user });
      })
      .catch(err => console.error(err.toString()));
  };

  addPort = (form, cb) => {
    console.log(form);
    fetch("/api/v3/tcp/addport", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json" },
      body: JSON.stringify(form)
    }).then(response => response.json())
      .then((data) => { 
        if (data.err) { 
          cb(data.err, undefined)
        } else {
          cb(undefined, data);
        }
        this.getPorts(); 
      })
      .catch(err => console.error(err.toString()));
  };

  getPorts = () => {
    fetch("/api/v3/tcp/ports", { method: "GET" })
      .then(res => res.json())
      .then(ports => {
        this.setState({ ports });
      })
      .catch(err => console.error(err.toString()));
  };

  componentDidMount = () => {
    this.getAccount();
    this.getPorts();

    socket.on("plugin",(data)=>{
      console.log(data);
      this.getPorts();
    })
  };

  update = () => {
    this.getAccount();
    this.getPorts();
  }

  render() {
    return (
      <div>
        <AddPort formSubmit={this.addPort} />
        <PortList list={this.state.ports} update={this.update} />
      </div>
    );
  }
}
