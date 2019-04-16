import React, { Component } from "react";
const Cryptr = require('cryptr');
const cryptr = new Cryptr('prototype');
export class SetUsername extends React.Component {

    state = {
        available: false,
        username: undefined,
        message: "",
        password: "",
        confirm: "",
        messagepass: "",
        currentpassword: "",
    }

    componentDidMount() {

    }

    onChange = () => {
        return (evt) => {
            this.setState({ username: this.cleaner(evt.target.value) }, () => {
                this.checkUpdateUsername();
            })
        }
    }

    checkUpdateUsername = () => {
        fetch('/api/v3/account/checkupdateusername', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: this.state.username })
        }).then(response => response.json()).then((data) => {
            if (data.available == true) {
                this.setState({ available: true })
            } else {
                this.setState({ available: false })
            }
        }).catch(err => console.error(err.toString()))
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

    currentpassword = (pass) => {
        return (evt) => {
            this.setState({ currentpassword: evt.target.value })
        }
    }

    showButton = () => {
        if (this.state.available == false) {
            return (<div>not available try a different username.</div>)
        } else {
            return (<button onClick={this.updateUsername} className="btn-spot" style={{ float: "right" }} > SAVE</button>)
        }
    }

    checkpassword = () => {
        if (this.state.confirm != "" && this.state.password != "" && this.state.currentpassword != "") {
            if (this.state.confirm != this.state.password) {
                this.setState({ message: "New password and confirm password do not match" })
            }
            else {
                fetch("/api/v3/admin/userpassword", {

                    method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
                    body: JSON.stringify({
                        pass: cryptr.encrypt(this.state.password),
                        user: this.state.username,
                        current: cryptr.encrypt(this.state.currentpassword)
                    })
                }).then(response => response.json()).then(data => {
                    if (data == false) {
                        this.setState({ message: "Incorrect Current Password" })
                    }
                    else {
                        this.setState({ message: "Password has successfully been changed" })
                    }
                }).catch(err => console.error(err.toString()))
            }
        }
        else {
            this.setState({ message: "Field(s) can not be empty" })
        }
    }

    updateUsername = () => {
        fetch('/api/v3/account/updateusername', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: this.state.username })
        }).then(response => response.json()).then((data) => {
            this.props.usernameUpdated();
        }).catch(err => console.error(err.toString()))
    }

    render() {

        if (this.props) {
            if (this.state.username == undefined) {
                if (this.props.username) {
                    this.setState({ username: this.props.username });
                }
            }
        }

        return (
            <div>
                <h3 style={{ marginTop: "5px" }}> Username </h3>
                <p>Here you can change your public username. This must be unique across the system. It will affect your public url in the form of /u/username</p>
                <input
                    style={{ width: "50%" }}
                    value={this.state.username}
                    onChange={this.onChange()}
                    autoFocus={true}
                />
                {this.showButton()}<hr></hr>
                <h3> CHANGE PASSWORD </h3>

                <div >Current password: <br></br><input className="fullWidth" type="password" placeholder="current password" name="current" style={{ marginBottom: 5, width: "50%" }} onChange={this.currentpassword("current")} value={this.state.currentpassword} spellCheck="false" /><br></br>
                    New password: <br></br><input className="fullWidth" type="password" placeholder="new password" name="password" onChange={this.passwordInput("password")} value={this.state.password} style={{ marginBottom: 5, width: "50%" }} spellCheck="false" /><br></br>
                    Confirm password: <br></br><input className="fullWidth" type="password" placeholder="confirm password" name="confirm" style={{ marginBottom: 5, width: "50%" }} onChange={this.confirmInput("confirm")} spellCheck="false" />
                    <br></br><span className="serverError" style={{ fontSize: "11px" }} >{this.state.message}</span>
                    <button className="btn-spot floatLeft" style={{ float: "right" }} onClick={this.checkpassword} >CHANGE PASSWORD</button></div>
            </div>
        )
    }

    cleaner(str) {
        var strLower = str.toLowerCase();
        return strLower.replace(/\W/g, '');
    }
}


