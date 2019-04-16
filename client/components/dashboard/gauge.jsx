import React, { Component } from 'react';
import { Vector } from "../../../src/utils/vector"
import { Widget } from "./widget.jsx"

export class ProtoGauge extends React.Component {

    state = {
        value: 0,
        min: 0,
        max: 100,
        valueanim: 0,
        typeError: false,
        color: "#11cc88"
    }

    animtimer;

    options;

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

        if (this.props.data.options) {
            this.setState(_.merge(this.state, this.props.data.options), () => {
                this.updatedOptions();
            });
        } else {
            this.updatedOptions();
        }

        this.animtimer = setInterval(() => {
            // var targetval = this.state.value + 5

            // if (targetval > this.state.max) {
            //     this.setState({ value: this.state.min })
            // } else {
            //     this.setState({ value: targetval })
            // }
            if (this.props.value) {

                if (typeof this.props.value != "number") {
                    console.log("guage requires value of type number")
                    this.setState({ typeError: true })
                } else {
                    //ANIMATE GAUGE

                    // ADJUST FOR MAX
                    if (this.props.value > this.state.max) {
                        var options = { max: this.props.value + 1 }
                        this.setState(options)
                        this.props.setOptions(options)
                    }

                    if (this.props.value < this.state.min) {
                        var options = { min: this.props.value - 1 }
                        this.setState(options)
                        this.props.setOptions(options);
                    }

                    if (this.state.valueanim != this.props.value) {
                        var difference = this.props.value - this.state.valueanim
                        var step = difference / 10;
                        var valueanim = this.state.valueanim + step;
                        this.setState({ valueanim: valueanim })
                    }
                }

                //SET VALUE
                if (this.state.value != this.props.value) {
                    this.setState({ value: parseFloat(this.props.value) })
                }
            }
        }, 1000 / 30)
    }

    componentWillUnmount() {
        clearInterval(this.animtimer);
    }

    polar_to_cartesian = function (cx, cy, radius, angle) {
        var radians;
        radians = (angle - 90) * Math.PI / 180.0;
        return [Math.round((cx + (radius * Math.cos(radians))) * 100) / 100, Math.round((cy + (radius * Math.sin(radians))) * 100) / 100];
    };

    svg_arc_path = function (x, y, radius, start_angle, end_angle) {
        var center = new Vector({ x, y })
        var start = new Vector({ x: -radius })
        var end = new Vector({ x: -radius })
        start.rotate(new Vector({ z: 1 }), start_angle)
        end.rotate(new Vector({ z: 1 }), end_angle)

        var largeArcFlag = "0"
        if ((end_angle - start_angle) > Math.PI) {
            largeArcFlag = "1"
        }

        return "M " + (start.x + center.x).toFixed(3) + " " + (start.y + center.y).toFixed(3) + " A " + radius + " " + radius + " 0 " + largeArcFlag + " 1 " + (end.x + center.x) + " " + (end.y + center.y);
    };

    degrees(degrees) {
        return ((Math.PI * 2) / 360) * degrees
    }

    drawguageSvg(min, value, max) {
        if (this.state.typeError) {
            return null;
        } else {
            var range = max - min;
            var valr = value - min;
            var ratio = valr / range;

            var graphdegree = ((180 + 35 + 35) * ratio) - 35
            return (<path className="value" fill="none" stroke={this.state.color} strokeWidth="2.5" d={this.svg_arc_path(50, 50, 40, this.degrees(-35), this.degrees(graphdegree))}></path>)
        }

    }



    render() {

        return (
            <Widget label={this.props.data.dataname} options={this.options} dash={this.props.dash} setOptions={this.setOptions}>
                <svg viewBox="0 0 100 100" className="gauge">
                    <text
                        x="50"
                        y="50"
                        fill="#fff"
                        className="value-text"
                        fontSize="100%"
                        fontWeight="normal"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        dominantBaseline="central">{this.state.value.toFixed(2)}</text>

                    <text x="0" y="80"
                        fill="#aaa"
                        className="value-text"
                        fontSize="40%"
                        fontWeight="normal"
                        textAnchor="start"
                        alignmentBaseline="top"
                        dominantBaseline="central">MIN:{Math.round(this.state.min)}</text>

                    <text x="100" y="80"
                        fill="#aaa"
                        className="value-text"
                        fontSize="40%"
                        fontWeight="normal"
                        textAnchor="end"
                        alignmentBaseline="top"
                        dominantBaseline="central">MAX:{Math.round(this.state.max)}</text>

                    <path className="value" fill="none" stroke="#222" strokeWidth="2.5" d={this.svg_arc_path(50, 50, 40, this.degrees(-35), this.degrees(180 + 35))}></path>
                    {this.drawguageSvg(this.state.min, this.state.valueanim, this.state.max)}
                </svg>
            </Widget >
        );

    }
};

