import React, { Component } from "react";

import "../prototype.scss"
import { BrowserRouter as Router, Route, Link } from "react-router-dom";


export default class Stats extends React.Component {
  state = { stats: {} }

  userNameList = () => {
    try {
      return (<div>
        {
          //this.state.stats.users24hList.map( (user, i) =>  <span key={i} title={ user.email }>{ user.email.split("@")[0] } </span> )
          this.state.stats.users24hList.map((user, i) => {
            return <Link key={i} to={"/u/" + user.username}>{user.username} </Link>
          })
        }
      </div>)
    } catch (err) { }
  }

  accountStats = () => {
    try {
      var packetsToday = this.pluralSingular(this.state.accountStats.packetsToday, "packet", "packets")
      var packetsMonthCount = this.pluralSingular(this.state.accountStats.packetsMonth.packetsCount, "packet", "packets")
      var packetsTotal = this.pluralSingular(this.state.accountStats.packetsTotal, "packet", "packets")

      var devicesToday = this.pluralSingular(this.state.accountStats.statesActive, "device", "devices")
      var devicesTotal = this.pluralSingular(this.state.accountStats.statesTotal, "device", "devices")

      return (<div>
        Your account has seen {packetsToday} today, {packetsMonthCount} this month and {packetsTotal} ever. You have {devicesToday} active today out of {devicesTotal} total.
      </div>)
    } catch (err) { }
  }

  componentDidMount = () => {
    fetch("/api/v3/stats", {
      method: "GET", headers: { "Accept": "application/json", "Content-Type": "application/json" }
    }).then(response => response.json()).then(stats => {
      this.setState({ stats })
    }).catch(err => console.error(err.toString()));

    fetch("/api/v3/account/stats", {
      method: "GET", headers: { "Accept": "application/json", "Content-Type": "application/json" }
    }).then(response => response.json()).then(accountStats => {
      this.setState({ accountStats })
    }).catch(err => console.error(err.toString()));
  }

  pluralSingular = (count, word, words) => {
    if (count == 0) { return count + " " + words }
    if (count == 1) { return count + " " + word }
    return count + " " + words;
  }

  render() {

    return (<div></div>)

    return (
      <div>
        <div className="panel">
          {this.accountStats()}
        </div>
        <div className="panel">
          In the last 24 hours {this.state.stats.users24h} active users, {this.state.stats.states24h} devices and {this.state.stats.packets24h} packets of data.
        {/* ( {this.state.stats.users1w} this week,  {this.state.stats.users1m} this month ) */}
          {/* { JSON.stringify(this.state.stats.users24hList)} */}
          {this.userNameList()}
        </div>
      </div>
    )
  }
}