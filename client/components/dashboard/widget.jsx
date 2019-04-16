import React, { Component } from "react";

import { OptionsInput } from "./options/options_input.jsx"
import { OptionsColor } from "./options/options_color.jsx"

export class Widget extends React.Component {
  state = {
    menuVisible: false,
    boundaryVisible: false
  }

  removeWidget = () => {
    if (this.props.dash.remove) { this.props.dash.remove() }
  }

  optionsPanel = () => {
    if (this.props.options) {
      return (<div>{this.props.options.map((option, i) => {

        if (option.type == "input") { return (<OptionsInput key={i} option={option} setOptions={this.props.setOptions} />) }
        if (option.type == "color") { return (<OptionsColor key={i} option={option} setOptions={this.props.setOptions} />) }

        return (<div key={i}></div>)

      })}</div>)
    } else {
      return (<div className="widgetMenuItem">Widget has no options.</div>)
    }

  }

  menu() {
    if (this.state.menuVisible) {
      return (<div className="widgetMenu" style={{
        position: "absolute",
        zIndex: 100,
        width: 200,
        fontSize: 14
      }} >
        <div className="widgetMenuItem widgetMenuItemButton" onClick={this.removeWidget} >
          <i className="fas fa-trash-alt"></i> REMOVE</div>

        <div className="widgetMenuItem" >Change Type:
          <select onChange={(e) => {
            // console.log(e.target.value);
            this.props.dash.change("type", e.target.value)
          }}>

            {/* You can add widgets to the dropdown below:
                Please keep the below names the same as the .jsx file for the widget for sanity. */}
            <option unselectable="true">select</option>
            <option>Calendar</option>
            <option>NivoLine</option>
            <option>ChartLine</option>
            <option>Blank</option>
            <option>ThreeDWidget</option>
            <option>Gauge</option>
            <option>mesh</option>
            <option>map</option>
            {/* <option>button</option> */}
            <option>widgetButton</option>
          </select></div>

        {this.optionsPanel()}
      </div>)
    } else {
      return null;
    }
  }

  showMenu = () => {
    return (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.state.menuVisible) {
        this.setState({ menuVisible: false })
      } else {
        this.setState({ menuVisible: true })
      }
    }
  }


  devicePathButton = (name) => {
    if (name == "map") {
      if (this.props.deviceSelected == false || this.props.deviceSelected == undefined) {
        return (
          <div style={{ padding: "4px 6px 4px 6px", color: "grey", opacity: "0.3", cursor: "not-allowed" }}><i className="fas fa-route" title="Select a device"></i></div>
        )
      } else {
        return (
          <div className="widgetOptionsButton" style={{ padding: "4px 6px 4px 6px" }}><i className="viewButton fas fa-route" title="Show Boundary" onClick={() => { this.showPathHistory() }}></i></div>
        )
      }
    } else {
      return (
        <div style={{ display: "none" }}></div>
      )
    }
  }

  showPathHistory = () => {
    if (this.state.boundaryVisible == false) {
      this.props.showBoundary();
      this.setState({ boundaryVisible: true })
    } else if (this.state.boundaryVisible == true) {
      this.props.showBoundary();
      this.setState({ boundaryVisible: false })
    }
  }

  getWrench = () => {
    if (this.props.widget == false && this.props.label == "map") {
      return (
        <div></div>
      )
    } else {
      return (
        <div>
          <div className="widgetOptionsButton"
            onClick={this.showMenu()}
            style={{ padding: "4px 6px 4px 6px" }} >
            <i className="fas fa-wrench"  ></i></div>
          {this.menu()}
        </div>
      )
    }
  }
  // This must move into the map widget!
  // mapWidget = () => {
  //   var p = this.props.children.type;
  //   var color = "";
  //   if (this.props.children.type.name == "MapDevices") {
  //     if (this.state.boundaryVisible == true) {
  //       color = "white";
  //     } else {
  //       color = "grey";
  //     }
  //     return (
  //       <div className="widgetOptionsButton" style={{ padding: "4px 6px 4px 6px", color: color }} ><i className="fas fa-route" title="Show Boundary" onClick={this.showBoundary}></i></div>
  //     )
  //   } else {
  //     return;
  //   }
  // }

  getwidgetoptions = (options) => {
    this.setState({ options })
  }

  render = () => {
    return (
      < div style={{ overflow: "hidden" }
      } style={{ height: "100%", position: "relative", paddingTop: 30 }}>

        <div className="widgetTitleBar" >
          <div className="widgetGrab" >{this.props.label} </div>
          {this.devicePathButton(this.props.label)}
          <div className="widgetOptions">
            {this.getWrench()}
          </div>
        </div>

        <div className="widgetContents" height="100%" width="100%" style={{ height: "100%", width: "100%" }}>
          {this.props.children}
        </div>

        <div style={{ clear: "both" }}></div>
      </div >
    )
  }

}