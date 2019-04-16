import React, { Component } from 'react';
import { Widget } from "./widget.jsx"

export class WidgetButton extends React.Component {

  state = {
    color: "#111111",
    background: "#11cc88",
    command: JSON.stringify({ "foo": true }),
    buttonText: "SEND"
  }

  options;

  setOptions = (options) => {
    this.setState(_.merge(this.state, options), () => {
      this.updatedOptions();
    })
    this.props.dash.setOptions(options);
  }

  updatedOptions = () => {
    var options = [
      { name: "color", type: "color", value: this.state.color },
      { name: "background", type: "color", value: this.state.background },
      { name: "command", type: "input", value: this.state.command },
      { name: "buttonText", type: "input", value: this.state.buttonText }
    ]
    this.options = options;
  }

  componentDidMount() {
    if (this.props.data.options) {
      this.setState(_.merge(this.state, this.props.data.options));
    }
    this.updatedOptions();
  }

  onClick = () => {
    //console.log(this.props)
    fetch("/api/v3/data/post", {
      method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ id: this.props.state.devid, data: JSON.parse(this.state.command) })
    }).then(response => response.json()).then(resp => {
      console.log(resp);
    }).catch(err => console.error(err.toString()));
  }

  render() {
    return (<Widget label={this.props.data.dataname} options={this.options} dash={this.props.dash} setOptions={this.setOptions}>
      <button style={{ width: "100%", height: "100%", color: this.state.color, background: this.state.background, border: "none" }}
        onClick={this.onClick} >{this.state.buttonText}</button>
    </Widget>
    );
  }
};

