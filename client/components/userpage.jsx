import React, { Component } from "react";
import moment from 'moment'
import Media from "react-media";

export class UserProfile extends Component {
    showInfor = () => {
        return (
            <Media query="(max-width: 599px)">
                {matches => {
                    var infor = {
                        createdDate: "",
                        lastSeen: ""
                    }
                    matches ? (
                        infor
                    ) : (
                            infor = {
                                createdDate: this.props.user["_created_on"],
                                lastSeen: this.props.user["_last_seen"]
                            }
                        )
                    return (
                        <div>
                            Created: {infor.createdDate} ( {moment(this.props.user["_created_on"]).fromNow()}) <br />
                            Last Seen: {infor.lastSeen} ( {moment(this.props.user["_last_seen"]).fromNow()}) <br />
                            Device Count: {this.props.user["devicecount"]}
                        </div>
                    )
                }
                }
            </Media>
        )
    }

    render() {
        var timeago = moment(this.props.user["_created_on"]).fromNow()

        var avatar = "/avatar.jpg"

        if (this.props.user.github) {
            avatar = this.props.user.github.avatar_url
        }

        return (
            <div className="panel" style={{ marginTop: "70px", overflow: "auto" }}>
                <div className="avatarProfile" style={{ marginTop: "3px" }}> <img src={avatar} /></div>
                <h3> {this.props.user.username} </h3>
                {this.showInfor()}
            </div>
        )
    }
}

export class UserPage extends Component {

    state = {
        username: undefined
    }

    componentDidMount = () => {
        if (this.props.username) {
            this.setState({ username: this.props.username }, () => {
                this.getUserDetails();
            });
        }

    }

    getUserDetails = () => {
        fetch('/api/v3/user/' + this.state.username, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }).then(response => response.json()).then((user) => {
            //console.log(user);
            this.setState({ user })
        }).catch(err => console.error(err.toString()))
    }

    render() {

        if (this.state.user) {
            return (<UserProfile user={this.state.user} />)
        } else {
            return (<div></div>)
        }

    }
}
