import React, { Component } from 'react';
import { Vector } from "../../../src/utils/vector"
import { Widget } from "./widget.jsx"
import * as moment from "moment"
export class WidgetMesh extends React.Component {

    state = {
        value: 0,
        min: 0,
        max: 100,
        valueanim: 0,
        typeError: false,
        color: "#11cc88",
        mesh: [],
        calc: []
    }


    options;

    myRef;

    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }

    setOptions = (options) => {
        this.setState(_.merge(this.state, options))
        this.props.dash.setOptions(options);
    }

    updatedOptions = () => {
        var options = [
            { name: "min", type: "input", value: this.state.min },
            { name: "max", type: "input", value: this.state.max },
            { name: "color", type: "color", value: this.state.color }
        ]
        this.options = options;
    }

    componentDidMount() {
        this.myInput = React.createRef()

        if (this.props.data.options) {
            this.setState(_.merge(this.state, this.props.data.options), () => {
                this.updatedOptions();
            });
        } else {
            this.updatedOptions();
        }


    }


    /* takes in tree mesh with 6 nodes: [nodeId, childrenIds] and calculates x,y positions
        
    [
        [0, [1, 2, 3]],
        [1, [4, 5]],
        [2, []],
        [3, [6]],
        [4, []],
        [5, []],
        [6, []],
    ]

    */
    calcLocation(mesh) {

        const yscale = 100;
        const xscale = 100;


        var calc = {};
        var levely = 0;
        var levelx = 0;
        for (var node of mesh) {
            //console.log("parent " + node[0])

            if (!calc[node[0]]) {
                //console.log("creating parent " + node[0])
                calc[node[0]] = { id: node[0], x: 0, y: levely }
            } else {
                //console.log("already exists")
                levely = calc[node[0]].y
                levelx = calc[node[0]].x
            }

            var children = node[1];
            if (children.length > 0) {
                levely += yscale;
                var offsetx = (children.length - 1) * -xscale / 2;
                for (var c in children) {
                    var child = children[c]
                    if (calc[child]) {
                        //console.log("child " + child + " already exists")
                    } else {
                        //console.log("child " + child + " does not exist")
                        calc[child] = { id: child, x: levelx + 0 + (c * xscale) + offsetx, y: levely }
                    }
                }
            }
        }
        return calc;
    }

    calcLines(mesh, locations) {
        var lines = [];
        for (var node of mesh) {
            var children = node[1];
            if (children.length > 0) {
                for (var c in children) {
                    lines.push({ from: locations[node[0]], to: locations[children[c]] })
                }
            }
        }
        return lines;
    }

    onMouseOver(addr) {
        return (evt) => {
            if (addr != undefined) {
                this.setState({ focus: addr })
            }
        }

    }

    meshRender(mesh) {
        var nodeLocations = this.calcLocation(mesh);
        var lines = this.calcLines(mesh, nodeLocations);

        var xOffset;
        var yOffset = 50;

        // xOffset to half the available width
        if (this.myRef.current) {
            if (this.myRef.current.offsetWidth) {
                xOffset = this.myRef.current.offsetWidth / 2;
            }
        }

        if (xOffset) {
            return (<svg className="mesh" height="50%" width="100%" style={{ background: "#000" }} onMouseOver={this.onMouseOver()} >
                {lines.map((l, i) => {
                    return (<line key={i} x1={l.from.x + xOffset} y1={l.from.y + yOffset} x2={l.to.x + xOffset} y2={l.to.y + yOffset} strokeWidth="2" stroke={this.state.color} />)
                })}

                {Object.keys(nodeLocations).map((m, i) => {
                    return (<circle key={i}
                        onMouseOver={this.onMouseOver(m)}
                        style={{ cursor: "pointer" }}
                        cx={nodeLocations[m].x + xOffset}
                        cy={nodeLocations[m].y + yOffset}
                        r="7" fill={this.state.color} />)
                })}

                {Object.keys(nodeLocations).map((m, i) => {
                    return (<text
                        key={i}
                        x={nodeLocations[m].x + xOffset}
                        y={nodeLocations[m].y + yOffset + 20}
                        fill="#ffffff"
                        className="value-text"
                        fontSize="10px"
                        fontWeight="normal"
                        textAnchor="middle"
                        style={{ pointerEvents: "none" }}
                        alignmentBaseline="middle"
                        dominantBaseline="central">{
                            //m.split(":").join("")
                            this.showNodeAgo(m)
                        }
                    </text>)
                })}
            </svg>)
        }


    }


    showNodeAgo(addr) {
        try {
            var lastseen = moment(this.getNodeByAddr(addr).timestamp).fromNow()
            if (lastseen == "a few seconds ago") { lastseen = "online" }
            return lastseen
        } catch (e) {
            return "offline"
        }
    }

    getNodeByAddr(addr) {
        for (var n in this.props.state.payload.data.nodes) {
            if (this.props.state.payload.data.nodes[n].addr == addr) {
                return this.props.state.payload.data.nodes[n];
            }
        }
    }

    displayFocusData() {
        var focusData = {}

        if (this.state.focus) {

            /*for (var node of this.props.state.payload.data.nodes) {
                if (node.addr == this.state.focus) {
                    focusData = node
                }
            }
            */
            focusData = this.getNodeByAddr(this.state.focus)
        }

        return (<div style={{ textAlign: "left" }}><pre style={{ color: "#fff" }}>{JSON.stringify(focusData, null, 2)}</pre></div>)
        //return (<div style={{ textAlign: "left" }}><pre style={{ color: "#fff" }}>{JSON.stringify(this.props.state, null, 2)}</pre></div>)
        //return (<div style={{ textAlign: "left" }}><pre style={{ color: "#fff" }}>{JSON.stringify(this.state.focus, null, 2)}</pre></div>)

    }


    handleWidgetData(dataIn) {
        if (!dataIn) {
            return (<div>loading...</div>)
        }

        var parsedValue;

        try {
            parsedValue = JSON.parse(this.props.value);
        } catch (e) {
            return (<div>could not parse JSON</div>)
        }



        if (Array.isArray(parsedValue)) {

            if (parsedValue.length == 0) {
                return (

                    <div>Mesh is empty.</div>

                )
            }

            return (
                this.meshRender(parsedValue)
            );
        } else {
            return (
                <div>
                    This widget expects an Array in in the form:
<pre style={{ display: "block", textAlign: "left", color: "#fff" }}>
                        {`[
            [0, [1, 2, 3]],
            [1, [4, 5]],
            [2, []],
            [3, [6]],
            [4, []],
            [5, []],
            [6, []],
]`}</pre></div>
            )
        }



        return (<div>error</div>)
    }


    render() {
        return (
            <Widget label={this.props.data.dataname} options={this.options} dash={this.props.dash} setOptions={this.setOptions}>
                <div ref={this.myRef} style={{ height: "100%", width: "100%" }}>
                    {this.handleWidgetData(this.state.mesh)}
                    {this.displayFocusData()}

                </div>
            </Widget >
        )









    }
};

