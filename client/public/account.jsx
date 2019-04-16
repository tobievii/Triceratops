import React, { Component } from "react";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHdd,
  faUserCheck,
  faUserPlus,
  faDice
} from "@fortawesome/free-solid-svg-icons";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Media from "react-media";

library.add(faUserCheck);
library.add(faUserPlus);
library.add(faDice);
const Cryptr = require("cryptr");
const cryptr = new Cryptr("prototype");
export class Account extends Component {
  state = {
    menu: 0,
    url: "/",
    form: {
      email: "",
      passwordSignin: "",
      passwordSignup: ""
    },
    serverError: "",
    resetButton: "",
    forgotButton: "FORGOT PASSWORD",
    loginButton: "LOGIN",
    usedButton: null
  };

  // find out if the server allows registration
  getServerRegistrationOptions = () => {
    fetch("/api/v3/admin/registration", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(registration => {
        this.setState({ registration: registration.result });
      })
      .catch(err => console.error(err.toString()));
  };

  componentDidMount = () => {
    this.generateRandomPass();
    this.getServerRegistrationOptions();
  };

  generateRandomPass = () => {
    var form = { ...this.state.form };
    form["passwordSignup"] = this.generateDifficult(16);
    this.setState({ form });
  };

  generateDifficult = count => {
    var _sym = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    var str = "";
    for (var i = 0; i < count; i++) {
      var tmp = _sym[Math.round(Math.random() * (_sym.length - 1))];
      str += "" + tmp;
    }
    return str;
  };

  getMenuPageStyle = function(menu) {
    if (menu == this.state.menu) {
      return { display: "" };
    } else {
      return { display: "none" };
    }
  };

  getMenuClasses = function(num) {
    if (num == this.state.menu) {
      return "menuTab borderTopSpot paddingButton";
    } else {
      return "menuTab menuSelectable paddingButton";
    }
  };

  onClickMenuTab = function(menu) {
    return event => {
      if (this.state.menu == menu) {
        this.setState({ menu: 0 });
      } else {
        this.setState({ menu });
      }
    };
  };

  changeInput = name => {
    return evt => {
      var form = { ...this.state.form };
      form[name] = evt.target.value;
      this.setState({ form });
    };
  };

  validateEmail = email => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  signInKey = e => {
    if (e.key == "Enter") {
      this.signIn();
    }
  };

  signIn = () => {
    this.setState({ serverError: "" });
    fetch("/signin", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: this.state.form.email,
        pass: cryptr.encrypt(this.state.form.passwordSignin)
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.signedin) {
          location.reload();
        }

        if (data.error) {
          this.setState({ serverError: data.error });
        }
      })
      .catch(err => console.error(err.toString()));
  };

  register = () => {
    console.log("register");

    fetch("/api/v3/admin/register", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: this.state.form.email,
        pass: cryptr.encrypt(this.state.form.passwordSignup)
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          this.setState({ serverError: data.error });
        } else {
          location.reload();
          this.setState({ serverError: "Registration Successful" });
        }
      })
      .catch(err => console.error(err.toString()));
  };

  ForgotPassword = () => {
    fetch("/api/v3/account/recoveraccount", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: this.state.form.email
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.result) {
          this.setState({ resetButton: "RESET PASSWORD" });
          fetch("/api/v3/admin/recoverEmailLink", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: this.state.form.email
            })
          })
            .then(response => response.json())
            .then(data => {
              // fetch("/api/v3/admin/expire", {
              //   method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
              //   body: JSON.stringify({ person: this.state.form.email, button: true })
              // }).then(response => response.json()).then(data => { })
            });
        }

        if (data.error) {
          this.setState({ serverError: data.error });
        }
      })
      .catch(err => console.error(err.toString()));
  };

  drawRegisterButton = () => {
    if (this.state.registration) {
      if (this.state.registration.userRegistration) {
        return (
          <Media query="(max-width: 400px)">
            {matches =>
              matches ? (
                <div
                  className={this.getMenuClasses(2)}
                  onClick={this.onClickMenuTab(2)}
                  style={{
                    marginRight: "0",
                    right: "0",
                    width: "150",
                    float: "right"
                  }}
                >
                  REGISTER
                </div>
              ) : (
                <div
                  className={this.getMenuClasses(2)}
                  onClick={this.onClickMenuTab(2)}
                  style={{ width: "150", float: "right" }}
                >
                  REGISTER
                </div>
              )
            }
          </Media>
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  showButton = () => {
    if (this.state.resetButton == "") {
      return (
        <div className="row">
          <div className="col-7" style={{ textAlign: "right" }}>
            <span className="serverError" style={{ fontSize: "11px" }}>
              {this.state.serverError}
            </span>
          </div>
          <div className="loginB">
            <button
              className="btn-spot"
              style={{ float: "right" }}
              onClick={this.signIn}
            >
              <FontAwesomeIcon icon="user-check" /> Login{" "}
            </button>
            <a
              className="font-weight-bold spot"
              style={{
                float: "right",
                marginRight: 120,
                marginLeft: 15,
                marginTop: 12,
                color: "#E02430",
                cursor: "pointer"
              }}
              onClick={() => this.ForgotPassword()}
            >
              <u> {this.state.forgotButton} ? </u>{" "}
            </a>
          </div>
        </div>
      );
    } else {
      return (
        <div className="col-10" style={{ textAlign: "right" }}>
          <span className="serverError" style={{ fontSize: "auto" }}>
            Check email for Password recovery link(Valid only for 10 minutes)
          </span>
        </div>
      );
    }
  };

  levelZero = () => {
    return (
      <div
        className="navBar"
        style={{
          position: "absolute",
          width: 400,
          right: 20,
          top: 0,
          zIndex: 2000
        }}
      >
        <div className="row">
          <div className="col-md-12 ">
            {this.drawRegisterButton()}
            <div
              className={this.getMenuClasses(1)}
              onClick={this.onClickMenuTab(1)}
              style={{ width: "150", float: "right" }}
            >
              LOGIN
            </div>
          </div>
        </div>

        <div className="bgpanel" style={this.getMenuPageStyle(1)}>
          <div className="row" style={{ marginTop: 2, marginBottom: 5 }}>
            <div
              className="col-3"
              style={{ textAlign: "right", paddingTop: 10 }}
            >
              {" "}
              email:{" "}
            </div>
            <div className="col-9">
              {" "}
              <input
                type="email"
                placeholder="email"
                style={{ width: "100%" }}
                spellCheck="false"
                onKeyPress={this.signInKey}
                onChange={this.changeInput("email")}
                value={this.state.form.email}
                autoFocus
              />{" "}
            </div>
          </div>

          <div className="row" style={{ marginBottom: 15 }}>
            <div
              className="col-3"
              style={{ textAlign: "right", paddingTop: 10 }}
            >
              {" "}
              password:{" "}
            </div>
            <div className="col-9">
              <input
                placeholder="password"
                type="password"
                style={{ width: "100%" }}
                value={this.state.form.passwordSignin}
                onChange={this.changeInput("passwordSignin")}
                onKeyPress={this.signInKey}
              />
            </div>
          </div>
          {this.showButton()}
        </div>

        <div className="bgpanel" style={this.getMenuPageStyle(2)}>
          <div className="row" style={{ marginTop: 2, marginBottom: 5 }}>
            <div
              className="col-3"
              style={{ textAlign: "right", paddingTop: 10 }}
            >
              {" "}
              email:{" "}
            </div>
            <div className="col-9">
              <input
                placeholder="email"
                type="email"
                style={{ width: "100%" }}
                onChange={this.changeInput("email")}
                spellCheck="false"
                value={this.state.form.email}
              />
            </div>
          </div>

          <div className="row" style={{ marginBottom: 15 }}>
            <div
              className="col-3"
              style={{ textAlign: "right", paddingTop: 10 }}
            >
              {" "}
              password:{" "}
            </div>
            <div className="col-8">
              <input
                placeholder="password"
                spellCheck="false"
                style={{ width: "100%" }}
                value={this.state.form.passwordSignup}
                onChange={this.changeInput("passwordSignup")}
              />{" "}
            </div>

            <div
              className="col-1"
              style={{ padding: "8px 10px 0px 0px", fontSize: "120%" }}
            >
              <div>
                <FontAwesomeIcon
                  onClick={this.generateRandomPass}
                  className="smallIconClickable"
                  icon="dice"
                  title="Generate random"
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-7" style={{ textAlign: "right" }}>
              <span className="serverError" style={{ fontSize: "11px" }}>
                {this.state.serverError}
              </span>
            </div>

            <div className="col-5">
              <button
                className="btn-spot"
                style={{ float: "right" }}
                onClick={this.register}
              >
                <FontAwesomeIcon icon="user-plus" /> Register
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  render() {
    if (this.props.account) {
      if (this.props.account.level > 0) {
        return <span />;
      } else {
        return this.levelZero();
      }
    } else {
      return <span />;
    }
  }
}
