import React, { Component } from "react";

export class Toggle extends React.Component {
    render() {
        return (
            <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
            </label>
        )
    }
}
