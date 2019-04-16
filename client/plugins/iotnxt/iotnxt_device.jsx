import React, { Component } from "react";


export class DevicePluginPanel extends React.Component {
  state = {
    deviceGateway: {},
    accountGateway: {},
    serverGateways: [],
  }

  getAccount = () => {
    fetch("/api/v3/account").then(res => res.json()).then(user => {
      this.setState({ user })
    })
  }

  getDevice() {
    if (this.props.stateId) {
      fetch("/api/v3/state", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: this.props.stateId, username: this.props.username })
      }).then(response => response.json()).then((data) => {
        if (data.plugins_iotnxt_gateway) {
          this.setState({ deviceGateway: data.plugins_iotnxt_gateway })
        } else {

          this.setState({ deviceGateway: {} })
        }
      }).catch(err => console.error(this.props.url, err.toString()))
    } else {
      console.log(this.props)
    }

  }



  getServerGateways() {
    //SERVER GATEWAYS
    fetch('/api/v3/iotnxt/gateways').then(response => response.json()).then((gateways) => {
      if (gateways) {
        for (var g in gateways) {
          if (gateways[g].default) {
            this.setState({ serverGatewayDefault: gateways[g] });
          }
        }

        this.setState({ serverGateways: gateways });
      }
    }).catch(err => console.error(this.props.url, err.toString()))
  }

  renderDeviceGateway = () => {

    if (this.state.deviceGateway) {
      if (this.state.deviceGateway.GatewayId) {
        return <div><h5>DEVICE GATEWAY:</h5>
          {this.state.deviceGateway.GatewayId}<br />
          {this.state.deviceGateway.HostAddress}</div>
      }
    }

    if (this.state.user) {
      if (this.state.user.plugins_iotnxt_gatewaydefault) {
        if (this.state.user.plugins_iotnxt_gatewaydefault.GatewayId) {
          return <div><h5>ACCOUNT GATEWAY:</h5>
            {this.state.user.plugins_iotnxt_gatewaydefault.GatewayId}<br />
            {this.state.user.plugins_iotnxt_gatewaydefault.HostAddress}</div>
        }
      }
    }

    if (this.state.serverGatewayDefault) {
      return <div><h5>SERVER GATEWAY:</h5>
        {this.state.serverGatewayDefault.GatewayId}<br />
        {this.state.serverGatewayDefault.HostAddress}</div>
    }
  }

  onChange = (e) => {
    fetch('/api/v3/iotnxt/setgatewaydevice', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: this.props.device.key,
        id: this.props.stateId,
        GatewayId: e.target.value.split("|")[0],
        HostAddress: e.target.value.split("|")[1],
      })
    }).then(response => response.json()).then((data) => {
      this.getDevice();
    }).catch(err => console.error(this.props.url, err.toString()))

  }



  componentWillMount = () => {
    this.getServerGateways();
    this.getAccount();
    this.getDevice();
  }



  render() {
    return (
      <div className="commanderBgPanel">
        <h5>IOTNXT</h5>
        <p>Connects this device to IoTnxt portal/commander.</p>

        {this.renderDeviceGateway()}

        <br />
        <h5>SELECT FROM AVAILABLE GATEWAYS:</h5>
        <select style={{ width: "100%" }} className="settingsSelect" onChange={this.onChange} defaultValue={this.state.deviceGateway.GatewayId + "|" + this.state.deviceGateway.HostAddress}>
          <option key="none" value="none">select gateway</option>
          <option key="clear" value=" | ">clear</option>
          {
            this.state.serverGateways.map((sGateway) => {
              return <option key={sGateway.GatewayId + "|" + sGateway.HostAddress} value={sGateway.GatewayId + "|" + sGateway.HostAddress} >{sGateway.GatewayId + "|" + sGateway.HostAddress}</option>
            })
          }
        </select>

      </div>
    )
  }
}


