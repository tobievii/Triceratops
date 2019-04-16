import React, { Component } from "react";

import { Editor } from "./editor.jsx"
import { FileManager } from "./filemanager.jsx"

export const name = "Editor";

export class SettingsPanel extends React.Component {
    render() {
        return (
            <div>
                <FileManager />
                <Editor />
            </div>
        );
    }
}
