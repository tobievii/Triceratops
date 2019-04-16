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


  removeroute = route => {
    return event => {
      fetch("/api/v3/http/removeroute", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(route)
      })
        .then(response => response.json())
        .then(data => {
          if (this.props.update) { this.props.update(); }
        })
        .catch(err => console.error(err.toString()));
    };
  };




  render() {


    if (this.props.list) {
      if (this.props.list.length > 0) {

        return (
          <div style={blockstyle}>
            <div className="row" style={gridHeadingStyle}>
              <div className="col-2" style={{ paddingLeft: 37 }}>ID</div>
              <div className="col-1" style={{ textAlign: "left" }}>METHOD</div>
              <div className="col-4" style={{ textAlign: "left" }}>ROUTE</div>
              <div className="col-4" />
            </div>

            {this.props.list.map(route => {
              //console.log(route);
              return (
                <div key={route._id} className="row" style={gridstyle}>
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

                    {route.id}
                  </div>

                  <div className="col-1" style={{ padding: "10px 0px 10px 15px", textAlign: "left" }} >
                    {route.method}
                  </div>

                  <div className="col-4" style={{ padding: "10px 0px 10px 15px", textAlign: "left" }} >
                    <span>/plugin/http/</span>{route.route}
                  </div>

                  <div className="col-4" style={{ padding: 10, textAlign: "right" }} >


                    <div onClick={this.removeroute(route)} title={"Delete"}
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

                    {/* <div onClick={this.setApikey(port)} style={{
                        paddingRight: 10,
                        paddingTop: 1,
                        opacity: port.apikey ? 1.0 : 0.25,
                        cursor: "pointer",
                        float : "right"
                      }}><FontAwesomeIcon icon="user" />
                    </div> */}


                    {/* <div style={{float:"right",                        
                        paddingRight: 10,
                        paddingTop: 1}}>{port.connections}</div>*/}
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
