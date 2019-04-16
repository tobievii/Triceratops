import React, { Component } from "react";

import SyntaxHighlighter from "react-syntax-highlighter";
import { tomorrowNightBright } from "react-syntax-highlighter/styles/hljs";
import * as $ from "jquery";
import * as _ from "lodash"

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faHdd, faEraser } from "@fortawesome/free-solid-svg-icons";
import { DevicePluginPanel } from "../plugins/iotnxt/iotnxt_device.jsx";

import { DataView } from "./dataView.jsx"

import moment from 'moment'

library.add(faHdd);
library.add(faTrash);
library.add(faEraser);

import MonacoEditor from "react-monaco-editor";

import * as p from "../prototype.ts"

import socketio from "socket.io-client";



export class Editor extends React.Component {

    loadingState = 0;

    state = {
        message: "",
        messageOpacity: 0,
        loaded: 0,
        unsaved: false
    };

    saveWorkflow = () => {
        fetch("/api/v3/workflow", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: this.props.state.devid, code: this.state.code })
        })
            .then(response => response.json())
            .then(serverresponse => {
                this.setState({ message: serverresponse.result, messageOpacity: 1.0, unsaved: false });
                setTimeout(() => {
                    this.setState({ messageOpacity: 0 });
                }, 1000);
            })
            .catch(err => console.error(err.toString()));
    };

    componentDidMount = () => {
        document.addEventListener("keydown", e => {
            if (e.key.toLowerCase() == "s") {
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.saveWorkflow();
                }
            }
        });
    };

    loadLastPacket = (devid, cb) => {
        console.log("loadLastPacket")
        fetch("/api/v3/packets", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: devid, limit: 1 })
        })
            .then(response => response.json())
            .then(packets => {
                if (packets.length > 0) {
                    this.setState({ lastPacket: packets[0] })
                    this.setState({ packets: packets })
                } else {
                    this.setState({ packets: [] })
                    this.setState({ lastPacket: {} })
                }
            })
            .catch(err => console.error(err.toString()));
    };

    loadState = (devid, cb) => {
        fetch("/api/v3/state", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: devid })
        })
            .then(response => response.json())
            .then(data => {
                this.setState({ lastState: data });
                cb(undefined, data);
            })
            .catch(err => console.error(err.toString()));
    };

    loadStates = cb => {
        fetch("/api/v3/states/full", {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                //same as workflow
                var statesObj = {};
                for (var s in data) {
                    statesObj[data[s].devid] = data[s];
                }
                this.setState({ lastStates: data, lastStatesObj: statesObj });
                this.loadPluginDefinitions((e, pluginDefinitions) => {
                    cb(undefined, { lastStates: data, lastStatesObj: statesObj, pluginDefinitions });
                })

            })
            .catch(err => console.error(err.toString()));
    };


    loadPluginDefinitions = cb => {
        fetch("/api/v3/plugins/definitions", {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        }).then(response => response.json()).then(data => {
            this.setState({ pluginDefinitions: data });
            cb(undefined, data);
        }).catch((err) => {
            //console.error(err.toString())
            cb(undefined, []);
        });
    }

    awaitData = (data, cb) => {

        var checker = setInterval(() => {
            if (data === undefined) {

            } else {
                clearInterval(checker);
                cb(data);
            }
        }, 0)
    }

    editorDidMount = (editor, monaco) => {
        editor.focus();

        //fetch('/themes/Monokai.json')
        fetch("/themes/prototyp3.json")
            .then(data => data.json())
            .then(data => {
                monaco.editor.defineTheme("prototyp3", data);
                monaco.editor.setTheme("prototyp3");
            });


        this.loadStates((err, resp) => {
            // extra libraries
            // console.log("==========")
            // console.log(JSON.stringify(this.props.state.payload))

            var definitions = [
                "declare var packet = " + JSON.stringify(this.props.state.payload),
                // "const state = " + JSON.stringify(this.state.lastState),
                // "const states = " + JSON.stringify(resp.lastStates),
                // "const statesObj = " + JSON.stringify(resp.lastStatesObj),
                "declare var iotnxt = { register : ()=>{}, somenewapicall: ()=>{} }",
                "declare function callback(packet:any)",
                "declare class Facts {",
                "    /**",
                "     * Returns the next fact",
                "     */",
                "    static next():string",
                "}"
            ]

            definitions = definitions.concat(resp.pluginDefinitions.definitions);


            monaco.languages.typescript.javascriptDefaults.addExtraLib(
                definitions.join("\n"),
                "filename/facts.d.ts"
            );

        });

        window.addEventListener("resize", () => {
            editor.layout();
        });
    };

    onChange = (code, e) => {
        console.log(code)
        this.setState({ code: code, editorChanged: true, unsaved: true });
        this.props.onChange();
    };

    loadOnFirstData = () => {
        // if (this.props.deviceId) {
        //     if (this.loadingState === 0) {
        //         this.loadingState = 1
        //         this.loadState(this.props.deviceId, () => { });
        //         this.loadLastPacket(this.props.deviceId)
        //     }
        // }

        if (this.props.state) {
            if (this.props.state.workflowCode) {
                console.log("got state! got code");

                if (this.state.loaded == 0) {
                    var code = this.props.state.workflowCode;
                    this.setState({ loaded: 1 });
                    this.setState({ code });
                } else {
                    //console.log("already loaded code!")
                }
            } else {
                //console.log("got state! no workflow");
            }
        }
    };

    saveButton = () => {
        var unsavedClass = ""
        var text = ""
        if (this.state.unsaved) {
            unsavedClass = "deviceViewButtonAlert"
            text = "unsaved changes"
        }
        return (<div className={"deviceViewButton " + unsavedClass}
            style={{ float: "right" }}
            onClick={this.saveWorkflow} title="Save [CTRL+S]" > {text} <FontAwesomeIcon icon="hdd" /></div>)
    }

    ///https://microsoft.github.io/monaco-editor/playground.html#interacting-with-the-editor-adding-an-action-to-an-editor-instance

    render() {
        if (!this.props.state) {
            return (<div>loading...</div>)
        } else {
            //this.loadOnFirstData();

            if (!this.state.code) {
                if (this.props.state.workflowCode) {
                    this.setState({ code: this.props.state.workflowCode })
                } else {
                    this.setState({ code: `// uncomment below to test "workflow" processing \n// packet.data.test = "hello world"\ncallback(packet); ` })
                }
                return (<div>loading....</div>)
            } else {
                const options = {
                    selectOnLineNumbers: false,
                    minimap: { enabled: false }
                };
                return (
                    <div className="deviceViewBlock isResizable" style={{ marginBottom: 10 }}>
                        <div>
                            <div className="deviceViewTitle" >editor</div>
                            {this.saveButton()}
                            <div style={{
                                transition: "all 0.25s ease-out",
                                opacity: this.state.messageOpacity,
                                padding: 5,
                                width: 110,
                                float: "right", textAlign: "left", paddingLeft: 20
                            }} >{this.state.message}</div>
                            <div style={{ clear: "both" }} />
                        </div>

                        {/* <div>
                            <span title="Check to your left under packet history">packet</span>            
                            <span title={JSON.stringify(this.state.lastState, null, 2)}>state</span>                        
                            <span title={JSON.stringify(this.state.lastStates, null, 2)}>states</span>                        
                            <span title={JSON.stringify(this.state.lastStatesObj, null, 2)}>statesObj</span>                        
                        </div> */}

                        <div style={{ backgroundColor: "red", height: "100%" }}>
                            <MonacoEditor
                                height="2000"
                                width="6000"
                                language="javascript"
                                theme="vs-dark"
                                value={this.state.code}
                                options={options}
                                onChange={this.onChange}
                                automaticLayout={true}
                                editorDidMount={this.editorDidMount}
                            />
                        </div>
                    </div>
                );
            }




        }
    }
}
