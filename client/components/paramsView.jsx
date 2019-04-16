import React, { Component } from "react";

import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from 'react-bootstrap-table2-editor';

class CellEditor extends React.Component { 

  componentDidMount(){
    this.text.focus();
  }

  getValue(a,b,c) {
    return this.text.value
  }

  handleKeypress(e) {
    if (e.key === 'Enter') {
      console.log('do validate');
    }
  }

  render() {

    var { value, onUpdate, ...rest } = this.props;
    
    return [
      <div>
        <input
          {...rest}
          key="text"
          ref= { node => this.text = node}
          type="text"
          onKeyPress={ () => onUpdate(this.getValue()) }       
        />
      </div>
      
    ];
  }
}

// //{() => onUpdate(this.getValue())}

export class PayloadTable extends Component {
  state = {
    tableData: []
  }

  constructor (props) {
    super(props);
    console.log("----")
  }

  handleOnUpdate  = (a,b,c,d,e) => {
    console.log("handleOnUpdate")
  }

  onAfterSaveCell = (a, b, c, d, e) => {
    
    
    this.props.onSave();
    

  }

  render() {

    var tableData = [];

    if (this.props.payload) {
      if (this.props.payload.data) {
        if (this.props.payload.data.params) {
          //console.log(this.props.payload.data.params);
          tableData = this.props.payload.data.params;
          
        }
      }
    }


    const columns = [{ dataField: 'param', text: 'PARAMETER', editable: false },
    //{ dataField: 'desc', text: 'DESCRIPTION', editorRenderer: (editorProps, value, row, rowIndex, columnIndex) => ( <QualityRanger {...editorProps} value={value} /> ) },
    { dataField: 'desc', text: 'DESCRIPTION', editorRenderer: (editorProps, value, row, rowIndex, columnIndex) => ( <CellEditor {...editorProps} value={value} onUpdate={this.handleOnUpdate}/> ) },
    //{ dataField: 'desc', text: 'DESCRIPTION' },
    { dataField: 'units', text: 'UNITS' },
    { dataField: 'asp', text: 'ASP' },
    { dataField: 'aep', text: 'AEP' },
    { dataField: 'device', text: 'DEVICE', editable: false }
    ];

    return <BootstrapTable
      keyField="param"
      data={tableData}
      columns={columns}
      bordered={false}

      //cellEdit={cellEditFactory({ mode: 'click' })}
      cellEdit={cellEditFactory({ mode: "click", blurToSave: true, afterSaveCell: this.onAfterSaveCell })}
      //cellEdit={ { mode: "click", blurToSave: true, afterSaveCell: this.onAfterSaveCell } }

    />;
  }


}




export class RenderObject extends Component {
  state = {};
  render() {
    var payload = {};

    if (this.props.payload) {
      payload = this.props.payload;
      return (
        <p>
          {Object.keys(payload).map(name => (
            <RenderObjectChild key={name} name={name} details={payload[name]} />
          ))}
        </p>
      );
    } else {
      return (<p>empty</p>)
    }


  }
}

class RenderObjectChild extends Component {
  render() {
    // details is all the githubdata coming from the details prop above
    var { name, details } = this.props;

    if (typeof details == "object") {
      return (
        <div>
          {name} :<RenderObject payload={details} />
        </div>
      );
    } else {
      return (
        <div>
          {name} : {JSON.stringify(details)}
        </div>
      );
    }
  }
}

class MyAppChild extends React.Component {
  render() {
    return <li>{this.props.label + " - " + this.props.value}</li>;
  }
}

export class MetaView extends Component {
  state = {};
  render() {
    if (this.props.meta) {
      return (
        <div>

          {this.props.meta.ip} <br />
          {this.props.meta.userAgent}

        </div>
      );
    } else {
      return <p>meta</p>;
    }
  }
}



export class ParamsView extends Component {
  state = {
    devid: "loading",
    lastTimestamp: "no idea",
    packets: [],
    socketDataIn: {}
  };

  constructor(props) {
    super(props);
  }

  getName() {
    return "device name/id";
  }

  latestTimestamp() {
    return "no idea";
  }

  onSaveHandler = () => {
    console.log("-- handle Table update")
    console.log(this.props);
    if (this.props.onSave) {
      this.props.onSave();
    }
  }

  render() {
    var devid = "loading";
    var lastTimestamp = "";
    var packets = "";
    var socketDataIn = "socketDataIn";
    console.log(this.props);

    return (
      <div className="container commanderBgPanel">
        <div className="row">
          <div className="col-md-12">
            <div>
              <h3>{this.props.view.id} </h3>
              {this.props.view.timestamp} <br />
              <MetaView meta={this.props.view.meta} />
              <PayloadTable payload={this.props.view} onSave={this.onSaveHandler} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

