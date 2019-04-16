import React, { Component } from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export class Landing extends Component {
  previewDevices = () => {
    fetch("/api/v3/preview/publicdevices", {
      method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
    }).then(response => response.json()).then(serverresponse => {
    }).catch(err => console.error(err.toString()));
  }
  componentDidMount = () => {
    this.previewDevices();
  }
  render() {
    return (

      <div>

        <div style={{ backgroundImage: "url(/splash.jpg)", backgroundSize: "100% auto", minHeight: "500px", backgroundPositionY: "center" }}>
          <div className="container" >
            <div className="row">
              <div className="col-sm-5" style={{ color: "#173748", background: "rgba(255,255,255,0.95)", marginTop: 100, padding: 20, marginLeft: 20 }}>
                <h1>Internet of Things for everyone</h1>
                <p>A new IoT solution with the goal of taking down the barriers to connecting devices to the cloud.</p>
              </div>
              <div className="col-sm-7">

              </div>
            </div>
          </div>
        </div>



      </div>

    )
  }
}