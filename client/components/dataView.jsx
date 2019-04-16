import React, { Component } from "react";

import "../prototype.scss"


export class RenderObject extends Component {

  renderObject = (data) => {
    // return (
    //   <div className="dataView" >
    //     <div className="dataName"> {this.props.name} </div>
    //     {Object.keys(this.props.datain).map((name,i) => {
    //       return <RenderObject name={name} key={i} datain={this.props.datain[name]} />
    //     })}                  
    //   </div>
  }

  render() {

    // if (typeof this.props.datain == "object" ) {
    //   return this.renderObject(this.props.datain);
    // }

    // try {
    //   switch (typeof this.props.datain) {
    //     case "string":
    //       {
    //         return ( <div className="dataView" >{this.props.name}: {this.props.datain}</div>)
    //       }
    //       break;
    //     case "object":
    //       {
    //         return (
    //           <div className="dataView" >
    //             <div className="dataName"> {this.props.name} </div>
    //             {Object.keys(this.props.datain).map((name,i) => {
    //               return <RenderObject name={name} key={i} datain={this.props.datain[name]} />
    //             })}                  
    //           </div>
    //         );
    //       }
    //       break;
    //     default:
    //       {
    //         return ( <div className="dataView" >{this.props.name}: {JSON.stringify(this.props.datain)}</div> )
    //       }
    //   }
    // }  catch (err) {
    //   return ( <div>err</div>)
    // }

  }
}


export class DataView extends React.Component {

  state = {
    dragging: false
  }

  dragging = false;

  renderData = (data, level, path) => {

    if (data == null) { }
    if (typeof data == "string") {
      return <span style={{ float: "right", color: "#CCC" }}>{data.trim()}</span>
    }
    if (typeof data == "number") {
      return <span style={{ float: "right", color: "#15E47A" }}>{data}</span>
    }
    if (typeof data == "boolean") {
      if (data == true) {
        return <span style={{ float: "right", color: "#E4C315" }}>{data.toString()}</span>
      } else {
        return <span style={{ float: "right", color: "#15B9E4" }}>{data.toString()}</span>
      }

    }
    if (typeof data == "object") {

      if (data == null) {
        return <span style={{ float: "right", color: "#f77" }}>null</span>
      }

      if (Array.isArray(data)) {
        //Arrays
        return <div style={{}}>{this.renderObject(data, level + 1, path)}</div>
      } else {
        //Objects

        if (Object.keys(data).length > 1) {
          return <div style={{}}>{this.renderObject(data, level + 1, path)}</div>
        } else {
          return <div style={{}}>{this.renderObject(data, level + 1, path)}</div>
        }


      }

    }

  }

  renderObject = (data, level, path) => {

    return (
      <div style={{ overflowY: 'hidden', paddingBottom: 25 }}>
        {Object.keys(data).map((name, i) => {

          if (typeof data[name] == "object") {
            return (
              <div key={i} className="dataView" draggable onDragStart={(e) => this.onDragStart(e, name, i, data[name], level, path + "." + name)}  >
                <div className="dataViewName" style={{ color: "" }}>{name}:</div>
                <div className="dataViewValue" >{this.renderData(data[name], level, path + "." + name)}</div>
                <div style={{ clear: "both" }} />
              </div>)
          } else {
            return (
              <div key={i} className="dataView" draggable onDragStart={(e) => this.onDragStart(e, name, i, data[name], level, path + "." + name)}  >
                <div className="dataViewName" style={{ float: "left" }}>{name}:</div>
                <div className="dataViewValue" style={{ float: "right" }}>{this.renderData(data[name], level, path + "." + name)}</div>
                <div style={{ clear: "both" }} />
              </div>)
          }


        })}
      </div>
    )



  }

  onDragStart = (e, name, i, data, level, path) => {

    e.dataTransfer.setData('text/plain', 'anything');


    if (this.dragging == false) {
      //console.log({ e, name, i, data, level, path })
      this.dragging = true;
      e.data = data;
      e.dataname = name;
      e.datapath = path;

      setTimeout(() => {
        this.dragging = false;
      }, 500)

    } else {
      //console.log("already dragging")
    }

  }

  render() {

    if (this.props.data) {
      if (this.props.data.payload) {
        return (
          <div>
            {this.renderObject(this.props.data.payload, 0, "root")}
          </div>
        );
      } else {
        return (
          <div>
            {this.renderObject(this.props.data, 0, "root")}
          </div>
        );
      }
    } else {
      return (<div>loading..</div>)
    }

  }

}