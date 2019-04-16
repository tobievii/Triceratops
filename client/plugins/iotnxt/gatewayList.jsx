import React, { Component } from "react";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faServer,
  faUser,
  faTrashAlt,
  faCheckCircle,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";

library.add(faServer);
library.add(faUser);
library.add(faTrashAlt);
library.add(faCheckCircle);
library.add(faTimesCircle);


import { gridstyle, cellstyle, gridHeadingStyle, blockstyle} from "../../styles.jsx"

export class GatewayList extends React.Component {
  state = {};

  getaccount = () => {
    fetch("/api/v3/account", {method: "GET"}).then(res=>res.json()).then(user=>{
      if (user.plugins_iotnxt_gatewaydefault) {
        this.setState( { 
          accountgatewaydefault:user.plugins_iotnxt_gatewaydefault,
          user : user
        })
      } else {
        this.setState( { accountgatewaydefault:undefined });
      }
    }).catch(err=>console.error(err.toString()))
  }
  
  componentDidMount = () => {
    this.getaccount()    
  }

  componentDidUpdate = () => {
    
  }


  removeGateway = gateway => {
    return event => {
      fetch("/api/v3/iotnxt/removegateway", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(gateway)
      })
        .then(response => response.json())
        .then(data => {
          if (this.props.update) {
            this.props.update();
          }
        })
        .catch(err => console.error(err.toString()));
    };
  };

  setgatewayserverdefault = gateway => {    
    return event => {      
      fetch("/api/v3/iotnxt/setgatewayserverdefault", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(gateway)
      })
        .then(response => response.json())
        .then(data => {
          console.log(data);
          this.getaccount();
          if (this.props.update) {
            this.props.update();
          }
        })
        .catch(err => console.error(err.toString()));
    };
  };


  setgatewayaccountdefault = (gateway, clear) => {
    return event => {      
      console.log(clear);

      if (clear) {
        fetch("/api/v3/iotnxt/cleargatewayaccountdefault").then(response => response.json())
        .then(data => {
          console.log(data);
          this.getaccount();
          if (this.props.update) {
            this.props.update();
          }
        }).catch(err => console.error(err.toString()));


      } else fetch("/api/v3/iotnxt/setgatewayaccountdefault", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(gateway)
      }).then(response => response.json())
        .then(data => {
          this.getaccount();
          if (this.props.update) {
            this.props.update();
          }
        }).catch(err => console.error(err.toString()));
    };
  };

  renderDelete = (gateway) => {
    if (this.state.user) {
      
      if (this.state.user.level > 99) {
        
        return (
          <div
            onClick={this.removeGateway(gateway)}
            title={"Delete"}
            style={{
              float: "right",
              paddingRight: 10,
              paddingTop: 1,
              opacity: 0.25,
              cursor: "pointer"
            }}
          >
            <FontAwesomeIcon icon="trash-alt" />
          </div>
        )
      } else {
        return ( <div />)  
      }

    } else {
      return ( <div />)
    }
    
  }


  render() {
    if (this.props.gateways) {
      if (this.props.gateways.length > 0) {
       
        
        
        return (
          <div style={blockstyle}>
            <div className="row" style={gridHeadingStyle}>
              <div className="col-4" style={{paddingLeft:34}}>GatewayId</div>
              <div className="col-1" style={{textAlign:"center"}}>ENV</div>
              <div className="col-6" />
            </div>

            {this.props.gateways.map(gateway => {
              
              var accountdefault = false;
              if (this.state.accountgatewaydefault) {
                if (this.state.accountgatewaydefault.GatewayId && this.state.accountgatewaydefault.GatewayId) {
                  if (this.state.accountgatewaydefault.GatewayId == gateway.GatewayId && 
                    this.state.accountgatewaydefault.HostAddress == gateway.HostAddress) {
                      accountdefault = true;
                    }
                }
              }

              return (
                <div key={gateway.GatewayId} className="row" style={gridstyle}>
                  <div className="col-4" style={{ padding: 10 }}>

                    <div                      
                      title={
                        gateway.connected
                          ? "Connected"
                          : gateway.error
                      }
                      style={{
                        float: "left",
                        paddingRight: 10,
                        paddingTop: 1,
                        opacity: 0.9,
                        cursor: gateway.default ? "" : "pointer",
                        color : gateway.connected ? "rgb(0, 222, 125)" : "rgb(255, 57, 67)"
                      }}
                    >
                      <FontAwesomeIcon icon={ gateway.connected ? "check-circle" : "times-circle" }  />
                    </div>

                    {gateway.GatewayId}
                  </div>
                  <div className="col-1" style={{padding: 10, textAlign:"center"}} >
                    {gateway.HostAddress.split(".")[1].toUpperCase() }
                  </div>
                  <div className="col-6" style={cellstyle} >
                    <div
                      onClick={this.setgatewayserverdefault(gateway)}
                      title={
                        gateway.default
                          ? "Active default"
                          : "Click to set to default"
                      }
                      style={{
                        float: "left",
                        paddingRight: 10,
                        paddingTop: 1,
                        opacity: gateway.default ? 1.0 : 0.15,
                        cursor: gateway.default ? "" : "pointer"
                      }}
                    >
                      <FontAwesomeIcon icon="server" />
                    </div>

                    <div
                      onClick={this.setgatewayaccountdefault(gateway, accountdefault)}
                      title={
                        accountdefault
                          ? "Click to unset account gateway"
                          : "Click to set to default"
                      }
                      style={{
                        float: "left",
                        paddingRight: 10,
                        paddingTop: 1,
                        opacity: accountdefault ? 1.0 : 0.25,
                        cursor: "pointer"
                      }}
                    >
                      <FontAwesomeIcon icon="user" />
                    </div>



                      

                  </div>
                      
                  <div className="col-1" style={{padding: 10, textAlign:"right"}} >
                    { this.renderDelete(gateway) }
                  </div>
                    
                  

                </div>
              );
            }, this)}
          </div>
        );
      } else {
        return (
          <div style={{ textAlign: "center", opacity: 0.25 }}>
            No Gateways set
          </div>
        );
      }
    } else {
      return (
        <div style={{ textAlign: "center", opacity: 0.25 }}>Loading..</div>
      );
    }
  }
}
