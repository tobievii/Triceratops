import React, { Component } from "react";

export class OptionsColor extends React.Component {


  constructor(props) {
    super(props)
    this.state = { value: this.props.option.value }
    this.onChange = this.onChange.bind(this);
    //this.handleSubmit = this.handleSubmit.bind(this);
  }

  apply() {
    var option = {}
    option[this.props.option.name] = this.state.value;
    this.props.setOptions(option)
  }

  onKeyPress = (e) => {
    if (e.key == "Enter") {
      this.apply();
    }
  }

  onChange = (event) => {
    console.log(event.target.value)
    this.setState({ value: event.target.value }, () => {
      this.apply();
    });
  }

  render() {
    return (<div className="widgetMenuItem" onDrag={this.noDrag}
      onDragStart={this.noDrag} >
      {this.props.option.name}:
      <input
        type="color"
        value={this.state.value}
        onKeyPress={this.onKeyPress}
        onChange={this.onChange} >
      </input>
    </div>)
  }
}