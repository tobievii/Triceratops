import React, { Component } from 'react';
import { Widget } from "./widget.jsx"

export class WidgetBlank extends React.Component {

  state = {
    command: "asdf"
  }

  options = []

  onClick = () => {
    //console.log(this.props)
    fetch("/api/v3/data/post", {
      method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ id: this.props.state.devid, data: { click: true } })
    }).then(response => response.json()).then(resp => {
      console.log(resp);
    }).catch(err => console.error(err.toString()));
  }

  render() {
    return (
      <Widget label={this.props.data.dataname} options={this.options} dash={this.props.dash}>
        <div>{this.props.value}</div>
      </Widget>
    );
  }
};

