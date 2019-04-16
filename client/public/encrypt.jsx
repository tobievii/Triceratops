import React, { Component } from "react";
import ReactDOM from 'react-dom'
import App from '../App.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export class Encrypt extends Component {

    encryptpass = () => {
        fetch("/api/v3/account/secure", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(response => response.json()).then((data) => {
        }).catch(err => console.error(err))
    }
    render() {

        return (

            <div className="bgpanel" >
                <center>
                    <button className="btn-spot" style={{ float: "center" }} onClick={this.encryptpass}>ENCRYPT ALL PASSWORDS</button>
                </center>
            </div>
        )

    }

}