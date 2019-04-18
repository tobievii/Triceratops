import React, { Component } from "react";

import GridLayout from 'react-grid-layout';

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css"


import { Calendar } from "./nivo_calendar.jsx"
import { NivoLine } from "./nivo_line.jsx"

import * as _ from "lodash"

// https://github.com/STRML/react-grid-layout

import { Widget } from "./widget.jsx"

import { ThreeDWidget } from "./three.jsx"
import { ProtoGauge } from "./gauge.jsx"
import { MapDevices } from "./map.jsx"

import { ChartLine } from "./chart_line.jsx"
import { WidgetButton } from "./widgetButton.jsx"
import { WidgetBlank } from "./widget_blank.jsx"
import { WidgetMesh } from "./widget_mesh.jsx"
import { WidgetForm } from "./widget_form.jsx"

var mapDetails = {
  un: undefined,
  acc: undefined,
  dc: undefined,
  ds: undefined,
  showB: false
}

export class Dashboard extends React.Component {

  settingLayout = false;

  state = {
    grid: {
      width: 4000,
      cols: 40,
      rowHeight: 30
    },
    showB: false
  }

  draggingUnique = "";



  saveDashboard = () => {


  }

  onDragOver = (e, f) => {
    // let event = e
    e.stopPropagation();
    e.preventDefault();


    // var location = {
    //   x: Math.round(e.clientX / (this.state.grid.width / this.state.grid.cols)),
    //   y: Math.round(e.clientY / this.state.grid.rowHeight / 2) - 1
    // }

    // if (this.draggingUnique != "") {

    //   var needsUpdate = false;

    //   for (var widget of this.state.layout) {

    //     if (widget.i == this.draggingUnique) {
    //       if (widget.x != location.x) { needsUpdate = true; }
    //       if (widget.y != location.y) { needsUpdate = true; }
    //     }
    //   }


    //   if (needsUpdate) {

    //     var layout = _.clone(this.state.layout)

    //     var layout = layout.filter(w => {
    //       if (w.i == this.draggingUnique) {
    //         w.x = location.x
    //         w.y = location.y
    //         return w;
    //       } else { return w }
    //     })

    //     // for (var widget of layout) {
    //     //   if (widget.i == this.draggingUnique) {

    //     //   }
    //     // }

    //     var temp = this.draggingUnique;
    //     this.draggingUnique = "";

    //     this.setState({ layout }, () => {

    //       this.draggingUnique = temp;
    //     })
    //   }


    // } else {
    //   e.exists = true;



    //   var layout = _.clone(this.state.layout)
    //   var unique = this.generateDifficult(32)


    //   this.draggingUnique = unique;

    //   layout.push({ i: unique, x: location.x, y: location.y, w: 2, h: 3, type: "Blank", datapath: e.datapath, dataname: e.dataname })
    //   this.setState({ layout: layout })
    // }


  }


  onDrop = (e, f) => {
    e.preventDefault();
    var typel = undefined;
    // pixel location
    var droplocation = {
      x: e.pageX - e.target.getBoundingClientRect().x,
      y: e.pageY - e.target.getBoundingClientRect().y
    }

    // calculate row/column location for widget
    var location = {
      x: Math.max(0, Math.round(droplocation.x / (this.state.grid.width / this.state.grid.cols) - 0.5)),
      y: Math.max(0, Math.round(droplocation.y / this.state.grid.rowHeight / 2) - 1)
    }

    // add widget to layout

    if (e.dataname == "lat" || e.dataname == "lon" || e.dataname == "gps") {
      typel = "map"
      // } else if (typeof e.data == "boolean") {
      //   if (e.data == true) {
      //     typel = "booleanButtonTrue"
      //   } else {
      //     typel = "booleanButtonFalse"
      //   }
    } else if (typeof e.data == "string" || typeof e.data == "boolean") {
      typel = "Blank"
    } else {
      typel = "Gauge"
    }
    var layout = _.clone(this.state.layout)
    layout.push({ i: this.generateDifficult(32), x: location.x, y: location.y, w: 2, h: 5, type: typel, datapath: e.datapath, dataname: e.dataname })
    this.setState({ layout: layout }, () => { })
  }

  gridOnDragStart = (evt) => {
    //console.log(evt)
    //evt.preventDefault();
    //evt.stopPropagation();
  }
  gridOnDrag = (evt) => {
    //console.log("drag start"); 
    //evt.preventDefault();
    //evt.stopPropagation();
  }
  gridOnDragStop = () => {
    //console.log("drag stop"); 
  }
  gridOnResizeStart = () => {
    //console.log("resize start"); 
  }
  gridOnResize = () => {
    //console.log("resize "); 
  }
  gridOnResizeStop = () => {
    //console.log("resize stop"); 
  }

  gridOnLayoutChange = (layout) => {
    var updated = false; //should we update the server? default false.

    var newlayout = _.clone(this.state.layout)
    for (var widgetup of layout) {
      for (var widget of newlayout) {
        if (widget.i == widgetup.i) {
          // update on location/size changes
          if (widget.x != widgetup.x) { widget.x = widgetup.x; updated = true; }
          if (widget.y != widgetup.y) { widget.y = widgetup.y; updated = true; }
          if (widget.w != widgetup.w) { widget.w = widgetup.w; updated = true; }
          if (widget.h != widgetup.h) { widget.h = widgetup.h; updated = true; }
        }
      }
    }

    //if there are fewer or more widgets then we update the server
    if (layout.length != this.state.layout) {
      updated = true;
    }

    if (updated) {
      // update the server
      this.setState({ layout: newlayout }, () => {
        this.updateServer();
      })
    }
  }

  updateServer() {
    fetch("/api/v3/dashboard", {
      method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ key: this.props.state.key, layout: this.state.layout })
    }).then(response => response.json()).then(result => { })
      .catch(err => console.error(err.toString()));
  }

  widgetRemove = (id) => {
    return (e) => {
      var temp = this.state.layout.filter(item => { if (item.i != id) return item })
      this.setState({ layout: temp }, () => {
        this.updateServer();
      })
    }
  }

  widgetChange = (i) => {
    return (option, data) => {
      var layout = _.clone(this.state.layout);
      for (var w in layout) {
        if (layout[w].i == i) {
          if (data == "button") {
            if (this.objectByString(this.props.state.payload, layout[w].datapath.slice(5)).toString() == "true") {
              data = "booleanButtonTrue";
            } else if (this.objectByString(this.props.state.payload, layout[w].datapath.slice(5)).toString() == "false") {
              data = "booleanButtonFalse";
            } else {

            }
          }
          layout[w][option] = data;
        }
      }
      // console.log("widgetChange");
      // console.log({ option, data })
      this.setState({ layout }, () => {
        this.updateServer();
      })
    }
  }

  showBoundary = (action) => {
    if (action == true) {
      this.setState({ showB: true })
    } else if (action == false) {
      this.setState({ showB: false })
    }
  }

  setOptions = (data) => {
    return (options) => {
      // console.log("WIDGET OPTION CHANGE:")
      // console.log({ data, options })

      // find and update
      var layout = _.clone(this.state.layout);
      for (var w in layout) {
        if (layout[w].i == data.i) {
          if (layout[w].options) {
            layout[w].options = _.merge(layout[w].options, options);
          } else {
            layout[w].options = options;
          }
        }
      }

      //update server db
      this.setState({ layout }, () => { this.updateServer(); })
    }
  }

  // Depending on type prop of widget, this returns correct React component
  widgetType = (data) => {

    var dash = {
      change: this.widgetChange(data.i),
      remove: this.widgetRemove(data.i),
      setOptions: this.setOptions(data)
    }


    if (data.type == "Calendar") {
      return (<Calendar dash={dash}
        data={data} state={this.props.state} />)
    }

    if (data.type == "NivoLine") {
      return (<NivoLine
        dash={dash}
        data={data}
        state={this.props.state} datapath={data.datapath.split("root.")[1]} />)
    }

    if (data.type == "ChartLine") {
      return (<ChartLine
        dash={dash}
        data={data}
        state={this.props.state} datapath={data.datapath.split("root.")[1]} />)
    }

    // if (data.type == "booleanButtonFalse") {
    //   return (
    //     <div align="center">
    //       {this.objectByString(this.props.state.payload, data.datapath.slice(5)).toString()}
    //       <label class="switch">
    //         <input type="checkbox" />
    //         <span class="slider round"></span>
    //       </label>
    //     </div>
    //   )
    // }

    // if (data.type == "booleanButtonTrue") {
    //   return (
    //     <div align="center">
    //       {this.objectByString(this.props.state.payload, data.datapath.slice(5)).toString()}
    //       <label class="switch">
    //         <input type="checkbox" />
    //         <span class="slider round"></span>
    //       </label>
    //     </div>
    //   )
    // }

    if (data.type == "ThreeDWidget") {
      return (<ThreeDWidget
        dash={dash}
        data={data}
      />)
    }

    if (data.type == "Gauge") {
      var value;
      try {
        value = this.objectByString(this.props.state.payload, data.datapath.split("root.")[1])
      } catch (e) { }
      return (<ProtoGauge
        dash={dash}
        data={data}
        value={value} />)
    }

    if (data.type == "mesh") {
      var value;
      try {
        value = this.objectByString(this.props.state.payload, data.datapath.split("root.")[1])
      } catch (e) { }
      return (<WidgetMesh
        state={this.props.state}
        dash={dash}
        data={data}
        value={value} />)
    }

    if (data.type == "map") {
      return (<MapDevices
        dash={dash}
        data={data}
        username={this.props.username}
        acc={this.props.acc}
        deviceCall={this.props.state}
        devices={this.props.devices}
        widget={true}
        showBoundary={this.state.showB}
        PopUpLink={false} />)
    }

    if (data.type == "widgetButton") {
      return (<WidgetButton
        state={this.props.state}
        dash={dash}
        data={data}
      />)
    }


    if (data.type == "form") {
      return (<WidgetForm
        state={this.props.state}
        dash={dash}
        data={data}
      />)
    }

    // ADD WIDGETS ABOVE THIS LINE
    //////////

    if (data.type.toUpperCase() == "BLANK") {
      var a;
      try {
        a = JSON.stringify(this.objectByString(this.props.state.payload, data.datapath.slice(5))).toString()
      } catch (err) { a = "" }
      return (<WidgetBlank
        dash={dash}
        data={data}
        value={a} />)
    }

    //////////
  }

  addWidget = () => {
    var layout = _.clone(this.state.layout)
    layout.push({ i: this.generateDifficult(32), x: 0, y: 0, w: 2, h: 5, type: "widgetButton", datapath: "", dataname: "" })
    this.setState({ layout: layout }, () => { })
  }

  titlebarButtons = () => {
    return (
      <div>
        <div className="deviceViewButton" style={{ float: "right" }} title="Save layout [CTRL+S]" >
          <i className="fas fa-save"></i>
        </div>
        <div className="deviceViewButton" onClick={this.addWidget} style={{ float: "right" }} title="Add widget [CTRL+A]" >
          <i className="fas fa-plus-square"></i>
        </div>
      </div>)
  }

  generateDashboard = () => {
    if (!this.props.state) {
      return (<div>loading..</div>)
    } else {
      return (
        <div className="deviceViewBlock" style={{ marginBottom: 10 }}>
          <div>
            <div className="deviceViewTitle">dashboard</div>
            {this.titlebarButtons()}
            <div style={{ clear: "both" }} />
          </div>
          <GridLayout
            onDragStart={this.gridOnDragStart}
            onDrag={this.gridOnDrag}
            onDragStop={this.gridOnDragStop}
            onResizeStart={this.gridOnResizeStart}
            onResize={this.gridOnResize}
            onLayoutChange={this.gridOnLayoutChange}
            useCSSTransforms={false}
            onResizeStop={this.gridOnResizeStop}
            layout={this.state.layout}
            cols={this.state.grid.cols}
            draggableHandle=".widgetGrab"   // drag handle class
            rowHeight={this.state.grid.rowHeight}
            width={this.state.grid.width}>
            {
              this.state.layout.map((data, i) => {
                return (
                  <div className="dashboardBlock" key={data.i} onDrag={e => { e.preventDefault(); e.stopPropagation(); }} >
                    {this.widgetType(data)}
                    {/* <Widget label={data.dataname}
                      change={this.widgetChange(data.i)}
                      remove={this.widgetRemove(data.i)}
                      showBoundary={this.showBoundary}>  
                    </Widget> */}
                  </div>)
              })
            }
          </GridLayout>
        </div>
      )
    }
  }

  loading = () => {
    if (this.props.state) {

      if (this.props.state.layout) {

        if (this.settingLayout == false) {
          this.settingLayout = true;
          //console.log(this.props.state.layout)
          this.setState({ layout: this.props.state.layout })
        }

        return (<div>state</div>)
      } else {

        if (this.settingLayout == false) {
          this.settingLayout = true;
          this.setState({ layout: [{ i: "0", x: 0, y: 0, w: 8, h: 4, type: "Calendar", dataname: "calendar" }] }, () => { })
        }

        return (<div>loading</div>)
      }



    } else {
      //console.log("no props yet")
      return (<div>no props</div>)
    }

  }

  render = () => {
    if (this.state.layout) {

      return (
        <div
          style={{ minHeight: 50 }}
          onDragOver={(e) => this.onDragOver(e)}
          onDrop={(e) => this.onDrop(e, "complete")} >
          {this.generateDashboard()}
        </div>
      )
    } else {
      return this.loading();
    }

  }

  generateDifficult(count) {
    var _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
    var str = '';
    for (var i = 0; i < count; i++) {
      var tmp = _sym[Math.round(Math.random() * (_sym.length - 1))];
      str += "" + tmp;
    }
    return str;
  }

  objectByString = (o, s) => {

    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    }
    return o;
  }
}
