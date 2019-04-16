import React, { Component } from "react";
import protoGraphTheme from './theme.jsx'
import { Widget } from "./widget.jsx"

// Nivo calendar http://nivo.rocks/calendar

import { ResponsiveLine } from '@nivo/line'
//import "./index.scss"

export class NivoLine extends React.Component {
  state = {}

  lasttimestamp = "";

  componentDidMount() {
    if (this.props.state) {
      if (this.props.state.key) {

        this.fetchData(this.props.state.key, this.props.datapath)
      }
    }
  }



  componentDidUpdate() {


    if (_.has(this, "props.state.payload." + this.props.datapath)) {
      if (this.props.state.payload.timestamp != this.lasttimestamp) {



        var newdata = { x: this.props.state.payload.timestamp, y: _.get(this, "props.state.payload." + this.props.datapath) }

        if (this.state.linedata) {
          var linedata = _.clone(this.state.linedata)
          linedata[0].data.push(newdata)
          linedata[0].data = linedata[0].data.slice(-50);
          this.setState({ linedata })
        }
        //





        this.lasttimestamp = this.props.state.payload.timestamp;
      }
    }
    //console.log(this.props.state);
    //console.log(this.props.datapath)
  }

  fetchData(key, datapath) {
    fetch("/api/v3/packets", {
      method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ key, datapath, limit: 50 })
    }).then(response => response.json()).then(result => {
      //console.log(result);

      result = result.reverse();

      var linedata = [{
        id: datapath,
        color: "rgb(0, 255, 255)",
        data: result
      }]
      this.setState({ linedata })
    }).catch(err => console.error(err.toString()));
  }


  renderLine() {



    return (
      <ResponsiveLine
        data={this.state.linedata}
        margin={{
          "top": 35,
          "right": 35,
          "bottom": 55,
          "left": 55
        }}
        xScale={{
          "type": "point"
        }}
        yScale={{
          "type": "linear",
          "stacked": true,
          "min": "auto",
          "max": "auto"
        }}
        minY="auto"
        maxY="auto"

        stacked={true}
        curve="natural"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          "orient": "bottom",
          "tickSize": 5,
          "tickPadding": 5,
          "tickRotation": 0,
          "legend": this.props.datapath,
          "legendOffset": 36,
          "legendPosition": "middle"
        }}
        axisLeft={{
          "orient": "left",
          "tickSize": 5,
          "tickPadding": 5,
          "tickRotation": 0,
          "legend": "count",
          "legendOffset": -40,
          "legendPosition": "middle"
        }}
        dotSize={10}
        dotColor="inherit:darker(0.3)"
        colorBy={function (e) { return e.color }}
        dotBorderWidth={2}
        dotBorderColor="rgba(0,0,0,0)"
        enableDotLabel={true}
        dotLabel="y"
        dotLabelYOffset={-12}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        theme={protoGraphTheme}
      />

    )
  }

  render() {

    if (this.state.linedata) {
      return (<Widget label={this.props.data.dataname} options={this.options} dash={this.props.dash}>{this.renderLine()}</Widget>)
    } else {
      return (<Widget label={this.props.data.dataname} options={this.options} dash={this.props.dash}>Need data source.</Widget>)
    }

  }
}