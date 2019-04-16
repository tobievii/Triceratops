import React, { Component } from "react";

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHdd } from '@fortawesome/free-solid-svg-icons'

library.add(faHdd)

export const name = "Iot.nxt"

import { AddGatewayPanel } from "./addGateway.jsx"
import { GatewayList } from "./gatewayList.jsx"

import socketio from 'socket.io-client';
const socket = socketio();

export class SettingsPanel extends React.Component {
  state = { gateways: [] }

  loadServerGateways() {
    fetch('/api/v3/iotnxt/gateways').then(response => response.json()).then((data) => {
      if (data) { this.setState({ gateways: data }); }
    }).catch(err => console.error(this.props.url, err.toString()))
  }

  componentDidMount() {
    this.loadServerGateways();
    socket.on("plugin", (data) => {
      //console.log(data);
      this.loadServerGateways();
    })
  }

  update = () => { this.loadServerGateways(); }

  render() {
    return (
      <div>
        <AddGatewayPanel update={this.update} />
        <GatewayList user={this.state.user} gateways={this.state.gateways} update={this.update} />
      </div>
    )
  }
}


