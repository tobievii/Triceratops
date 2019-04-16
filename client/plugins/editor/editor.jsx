import React, { Component } from "react";

import MonacoEditor from 'react-monaco-editor';

export class Editor extends React.Component {

    state = { code:"asdf"}

    editorDidMount(editor, monaco) {
        console.log('editorDidMount', editor);
        editor.focus();
    }

    onChange(newValue, e) {
        console.log('onChange', newValue, e);
    }
    render() {
        const code = this.state.code;
        const options = {
            selectOnLineNumbers: false 
        };
        return (
            <MonacoEditor
                width="100%"
                height="1200px"
                language="javascript"
                theme="vs-dark"
                value={code}
                options={options}
                onChange={this.onChange}
                editorDidMount={this.editorDidMount}
            />
        );
    }
}
