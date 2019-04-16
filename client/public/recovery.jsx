import React, { Component } from "react";
import ReactDOM from 'react-dom'
import App from '../App.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Cryptr = require('cryptr');
const cryptr = new Cryptr('prototype');

export class Recovery extends Component {
  state = {
    changebutton: "",
    message: "",
    password: "",
    confirm: ""
  }

  checkpassword = () => {
    if (this.state.confirm != this.state.password) {
      this.setState({ message: "New password and confirm do not match" })
    }
    else {
      this.setState({ message: "Please wait for a few seconds..." })
      fetch("/api/v3/admin/changepassword", {
        method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          pass: cryptr.encrypt(this.state.password),
          person: this.props.recoverToken
        })
      }).then(response => response.json()).then(data => {

        if (data.nModified == 0) {
          this.setState({ message: "Password could not be changed Token has expired" })
        }
        else {
          this.setState({ message: "Password has successfully changed" })
        }
      })
    }
  }

  confirmInput = (confirm) => {
    return (evt) => {
      this.setState({ confirm: evt.target.value })
    }
  }
  passwordInput = (pass) => {
    return (evt) => {
      this.setState({ password: evt.target.value })
    }
  }

  render() {

    return (

      <div className="bgpanel" ><center><h4>Reset Password</h4>
        <div className="col-5" style={{ textAlign: "right", paddingTop: 10, paddingRight: 140 }} >Enter new password: <input type="password" placeholder="new password" name="password" onChange={this.passwordInput("password")} value={this.state.password} style={{ width: "60%", marginBottom: 5 }} spellCheck="false" autoFocus /><br></br>
          Confirm password: <input type="password" placeholder="confirm password" name="confirm" style={{ width: "60%", marginBottom: 5 }} onChange={this.confirmInput("confirm")} spellCheck="false" />  </div>
        <div className="col-5">
          <span className="serverError" style={{ fontSize: "11px" }} >{this.state.message}</span>
          <center>
            <button className="btn-spot" style={{ float: "center", display: this.state.changebutton }} onClick={this.checkpassword} >RESET PASSWORD</button></center>
        </div>
      </center>
      </div>
    )

  }
}