import React, { Component } from 'react';

export class Widget extends React.Component {
  state = {}

  render() {
    return (
      <button style={{ width: "100%", height: "100%" }} onClick={this.onClick}>SEND</button>
    );
  }
};

