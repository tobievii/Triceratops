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


export class AddPort extends React.Component {
  state = {
    form: {
      description: "",
      portNum: 12000
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
        <h4>ADD PORT</h4>

        <div className="row" style={formRowStyle}>
          <div className="col-4 alignLeft" style={formLabelStyle}>
            Description:
          </div>
          <div className="col-8" style={formInputStyle}>
            <input
              style={{ width: "100%" }}
              placeholder={this.state.form.description}
              onChange={this.changeInput("description")}
              autoFocus={true}
            />
          </div>
        </div>

        <div className="row" style={formRowStyle}>
          <div className="col-4 alignLeft" style={formLabelStyle}>
            Port Number:
          </div>
          <div className="col-8" style={formInputStyle}>
            <input
              style={{ width: "100%" }}
              placeholder={this.state.form.portNum}
              onChange={this.changeInput("portNum")}
              autoFocus={true}
            />
          </div>
        </div>

        <div className="row" style={formRowStyle} >
          <div className="col-4" style={formLabelStyle} ></div>
          <div className="col-8" style={formInputStyle}>

            <div className="commanderBgPanel commanderBgPanelClickable"
              style={{ width: 160, float: "left" }}
              onClick={this.onSubmit}>
              <FontAwesomeIcon icon="hdd" /> ADD PORT</div>

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