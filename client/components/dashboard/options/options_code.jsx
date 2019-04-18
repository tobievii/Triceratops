import React, { Component } from "react";

import MonacoEditor from "react-monaco-editor";

export class OptionsCode extends React.Component {



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

  editorDidMount(editor, monaco) {
    console.log("editorDidMount", editor);

    fetch("/themes/prototyp3.json")
      .then(data => data.json())
      .then(data => {
        monaco.editor.defineTheme("prototyp3", data);
        monaco.editor.setTheme("prototyp3");
      });

    editor.focus();
  }



  onChange(newValue, e) {
    //console.log('onChange', newValue, e);
    this.setState({ value: newValue });
    this.apply();
  }

  render() {

    const options = {
      selectOnLineNumbers: false,
      minimap: { enabled: false },
      lineNumbers: 'off',
      glyphMargin: false,
      folding: false,
      // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0
    };

    return (<div className="widgetMenuItem" onDrag={this.noDrag}
      onDragStart={this.noDrag} >
      {this.props.option.name}:



      <MonacoEditor
        width="400"
        height="500"
        language="json"
        theme="vs-dark"
        value={this.state.value}
        options={options}
        onChange={this.onChange}
        editorDidMount={this.editorDidMount}
      />

    </div>)
  }
}