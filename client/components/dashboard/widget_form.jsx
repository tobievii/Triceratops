import React, { Component } from 'react';
import { Widget } from "./widget.jsx"

/*
https://react-jsonschema-form.readthedocs.io/en/latest/
https://github.com/mozilla-services/react-jsonschema-form
*/
import Form from "react-jsonschema-form";


export class WidgetForm extends React.Component {

  state = {
    color: "#111111",
    background: "#11cc88",
    schema: JSON.stringify({
      title: "Todo",
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string", title: "Title", default: "A new task" },
        done: { type: "boolean", title: "Done?", default: false }
      }
    }),
    formData: {},
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
      { name: "schema", type: "code", value: this.state.schema, options: { language: "json" } },
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




  onChange = (data, e) => {
    console.log(data);
    this.setState({ formData: data.formData })
  }

  onSubmit = () => {
    fetch("/api/v3/data/post", {
      method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ id: this.props.state.devid, data: { formData: this.state.formData } })
    }).then(response => response.json()).then(resp => {
      console.log(resp);
    }).catch(err => console.error(err.toString()));
  }

  onError() {

  }

  render() {
    var formData = {}
    var schema = {}

    try {
      schema = JSON.parse(this.state.schema);
      formData = this.state.formData
    }
    catch (err) {
      schema = { err: err }
    }

    //const log = (type) => console.log.bind(console, type);
    return (<Widget label={this.props.data.dataname} options={this.options} dash={this.props.dash} setOptions={this.setOptions}>
      {/* <button style={{ width: "100%", height: "100%", color: this.state.color, background: this.state.background, border: "none" }}
        onClick={this.onClick} >{this.state.buttonText}</button> */}
      <Form schema={schema}
        formData={formData}
        onChange={this.onChange}
        onSubmit={this.onSubmit}
        onError={this.onError} />
    </Widget>
    );
  }
};

