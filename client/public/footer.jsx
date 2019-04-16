import React, { Component } from "react";

import "../prototype.scss"

export default class Footer extends React.Component {
  state = {}

  show = () => {
    if (this.props.loggedIn == false) {
      return (
        <div style={{}}>
          <div className="container">
            <div className="row">
              <div className="col-md-7" style={{}}>
                <img src="/screenshot.png" width="100%" style={{ border: "1px solid rgba(0,0,0,0.5)", borderRadius: "1px", imageRendering: "high-quality", margin: "50px 0 50px 0", boxSizing: "border-box", boxShadow: "0px 25px 39px 1px rgba(0,0,0,0.05)" }} />
              </div>
              <div className="col-md-5" style={{ paddingTop: 75 }}>
                <ul style={{ marginBottom: 50 }}>
                  <li>Simple as possible to connect your devices.</li>
                  <li>Multi protocol support: HTTP/S, MQTT, socketio, raw TCP, USB serialports and more.</li>
                  <li><a href="https://github.com/IoT-nxt/prototype">Opensource</a> so you can be sure what happens with your data.</li>
                  <li>Runs on windows/mac/linux, in the cloud or even a raspberry pi.</li>
                  <li>Fast mongodb for the data.</li>
                  <li>Extendable plugin architecture.</li>
                  <li>Edit code in the browser using the VSCode editor with intellisense autocompletion and deploy custom code instantly.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    }
    else if (this.props.loggedin == true) {
      return (
        <div></div>
      )
    }
  }
  render() {
    return (
      <div style={{ margin: 40 }}>
        {this.show()}

        <div className="" >
          <div className="row">
            <div className="col-12" style={{ fontSize: "150%", userSelect: "none", textAlign: "right" }}>

              <a className="footerButton" href="https://discord.gg/rTQmvbT"><i className="fab fa-discord"></i></a>&nbsp;
            <a className="footerButton" href="https://github.com/IoT-nxt/prototype"><i className="fab fa-github"></i></a>

            </div>

          </div>
        </div>
      </div>
    )
  }
}