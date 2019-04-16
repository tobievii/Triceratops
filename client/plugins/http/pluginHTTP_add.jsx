import React, { Component } from "react";

import {
  gridstyle,
  cellstyle,
  gridHeadingStyle,
  blockstyle,
  formLabelStyle,
  formInputStyle,
  formRowStyle
} from "../../styles.jsx";

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHdd } from '@fortawesome/free-solid-svg-icons'
library.add(faHdd)


export class AddRoute extends React.Component {
  state = {
    form: {
      route: "httpdevice",
      method: "get"
    },
    message: "", messageOpacity: 0
  };

  changeInput = name => {
    return evt => {
      var form = { ...this.state.form };
      form[name] = evt.target.value;
      this.setState({ form });
    };
  };

  onSubmit = () => {


    if (this.props.formSubmit) {
      this.props.formSubmit(this.state.form, (err, result) => {

        if (err) {
          console.log(err);
          this.setState({ message: err, messageOpacity: 1.0 })
          setTimeout(() => {
            this.setState({ messageOpacity: 0 })
          }, 1000);
        }


      });
    }

  }

  render() {
    return (
      <div style={blockstyle}>
        <h4>HTTP</h4>
        <p>
          Here you can set up custom HTTP routes. These are useful when accepting HTTP GET/POST calls from external apis. Github webhooks being a great example.
        </p>

        <div className="row" style={formRowStyle}>
          <div className="col-4 alignLeft" style={formLabelStyle}>
            ID
          </div>
          <div className="col-8" style={formInputStyle}>
            <input
              style={{ width: "100%" }}
              placeholder="httpDevice001"
              onChange={this.changeInput("id")}
              autoFocus={true}
            />
          </div>
        </div>

        <div className="row" style={formRowStyle}>
          <div className="col-4 alignLeft" style={formLabelStyle}>
            METHOD
          </div>
          <div className="col-8" style={formInputStyle}>
            {/* <input
              style={{ width: "100%" }}
              placeholder={this.state.form.portNum}
              onChange={this.changeInput("portNum")}
              autoFocus={true}
            /> */}

            <select name="method"
              onChange={this.changeInput("method")} >
              <option value="get">GET</option>
              <option value="post">POST</option>
              <option value="put">PUT</option>
              <option value="delete">DELETE</option>
            </select>


          </div>
        </div>

        <div className="row" style={formRowStyle} >
          <div className="col-4" style={formLabelStyle} ></div>
          <div className="col-8" style={formInputStyle}>

            <div className="commanderBgPanel commanderBgPanelClickable"
              style={{ width: 100, float: "left" }}
              onClick={this.onSubmit}>
              <FontAwesomeIcon icon="hdd" /> ADD</div>

            <div style={{
              transition: "all 0.25s ease-out",
              opacity: this.state.messageOpacity,
              marginTop: 17, marginBottom: 20, float: "left",
              textAlign: "right", paddingLeft: 20
            }}>
              {this.state.message}
            </div>

          </div>
        </div>


      </div>
    );
  }
}