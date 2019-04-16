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

import { gridstyle, cellstyle, gridHeadingStyle, blockstyle } from "../../styles.jsx"


export class PortList extends React.Component {
  state = { ports: [] };


  removePort = port => {
    return event => {
      fetch("/api/v3/tcp/removeport", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(port)
      })
        .then(response => response.json())
        .then(data => {
          if (this.props.update) { this.props.update(); }
        })
        .catch(err => console.error(err.toString()));
    };
  };

  setApikey = port => {
    return event => {

      if (port.apikey) {
        port.apikey = "1234";
      }

      fetch("/api/v3/tcp/setapikey", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(port)
      }).then(res => res.json()).then(data => {
        if (this.props.update) { this.props.update(); }
      }).catch(err => console.error(err.toString()))
    }
  }


  render() {


    if (this.props.list) {
      if (this.props.list.length > 0) {

        return (
          <div style={blockstyle}>
            <div className="row" style={gridHeadingStyle}>
              <div className="col-2" style={{ paddingLeft: 37 }}>Port</div>
              <div className="col-6" style={{ textAlign: "left" }}>Description</div>
              <div className="col-4" />
            </div>

            {this.props.list.map(port => {
              //console.log(port);
              return (
                <div key={port.portNum} className="row" style={gridstyle}>
                  <div className="col-2" style={{ padding: 10 }}>

                    <div

                      style={{
                        float: "left",
                        paddingRight: 10,
                        paddingTop: 1,
                        opacity: 0.9,
                        cursor: "pointer",
                        color: "rgb(0, 222, 125)"
                      }}
                    >
                      <FontAwesomeIcon icon={"check-circle"} />
                    </div>

                    {port.portNum}
                  </div>

                  <div className="col-6" style={{ padding: "10px 0px 10px 15px", textAlign: "left" }} >
                    {port.description}
                  </div>

                  <div className="col-4" style={{ padding: 10, textAlign: "right" }} >


                    <div onClick={this.removePort(port)} title={"Delete"}
                      style={{
                        paddingRight: 10,
                        paddingTop: 1,
                        opacity: 0.25,
                        cursor: "pointer",
                        float: "right"
                      }}
                    >
                      <FontAwesomeIcon icon="trash-alt" />
                    </div>

                    <div onClick={this.setApikey(port)} style={{
                      paddingRight: 10,
                      paddingTop: 1,
                      opacity: port.apikey ? 1.0 : 0.25,
                      cursor: "pointer",
                      float: "right"
                    }}><FontAwesomeIcon icon="user" />
                    </div>


                    <div style={{
                      float: "right",
                      paddingRight: 10,
                      paddingTop: 1
                    }}>{port.connections}</div>
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
