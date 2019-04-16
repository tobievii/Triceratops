import React, { Component } from "react";
import protoGraphTheme from './theme.jsx'

// Nivo calendar http://nivo.rocks/calendar

import { ResponsiveCalendar } from '@nivo/calendar'
import { Widget } from "./widget.jsx"

export class Calendar extends React.Component {
  state = { activity: [], from: "2018-01-01", to: "2018-11-22" }

  componentDidMount = () => {
    if (this.props.state) {
      //console.log("calendar:")
      //console.log(this.props.state)
      this.fetchData();
    }
  }

  fetchData = () => {
    fetch("/api/v3/activity", {
      method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ deviceid: this.props.state.devid })
    }).then(response => response.json()).then(activity => {

      if (activity.length > 2) {
        this.setState({ from: activity[0].day })
        this.setState({ to: activity[activity.length - 1].day })
      }

      this.setState({ activity })
    }).catch(err => console.error(err.toString()));
  }

  render() {
    return (<Widget label={this.props.data.dataname} options={this.options} dash={this.props.dash}>
      <ResponsiveCalendar
        data={this.state.activity}
        from={this.state.from}
        to={this.state.to}
        emptyColor="rgba(125, 125, 125,0.05)"
        colors={[
          "rgba(255, 57, 66,0.4)",
          "rgba(255, 57, 66,0.5)",
          "rgba(255, 57, 66,0.7)",
          "rgba(255, 57, 66,1)"
        ]}
        margin={{
          "top": 35,
          "right": 35,
          "bottom": 0,
          "left": 35
        }}
        yearSpacing={35}
        yearLegendOffset={11}
        monthBorderWidth={1}
        monthBorderColor="rgba(125, 125, 125,0.15)"
        monthLegendOffset={7}
        daySpacing={3}
        dayBorderWidth={2}
        dayBorderColor="rgba(247, 57, 67,0)"
        theme={protoGraphTheme}
      />
    </Widget>
    )
  }
}