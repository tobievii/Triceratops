import React, { Component } from "react";

export class Verify extends Component {
  state = {}

  requestVerificationMail = () => {
    console.log("verify")
    
    fetch("/api/v3/admin/requestverificationemail", { 
      method: "GET", 
      headers: { "Accept": "application/json", "Content-Type": "application/json" } })
      .then(response => response.json())
      .then(data => {
      console.log(data)
    }).catch(err => console.error(err.toString()));

  }

  render() {

    if (this.props.account) {
      if (this.props.account.emailverified == false) {
        return (<div className="notificationBlock" >
          <span>
            <i className="fas fa-exclamation-triangle"></i> Your email address has not been verified yet. Please check your inbox for your auth code.
          </span>
          <button onClick={this.requestVerificationMail}><i className="fas fa-envelope"></i> send new</button>
        </div>)
      } else {
        return null;
      }

    } else {
      return null;
    }

    
  }

}



