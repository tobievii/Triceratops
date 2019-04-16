import { confirmAlert } from 'react-confirm-alert';
import React, { Component } from "react";
import Modal from 'react-modal';
import { Stats } from "./stats.jsx"
var loggedInUser = "";
const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: '50%',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        border: "none",
        background: "rgba(3, 4, 5,0.6)",
        maxHeight: 'calc(100vh - 210px)',
        overflowY: 'auto',
    },
    //bacground of Pop up Modal on search
    overlay: {
        background: "rgba(27, 57, 77,0.9)",
    }
};
var count = 0;
export class ShareList extends Component {
    state = {

        devid: this.props.devid,
        lastTimestamp: "no idea",
        packets: [],
        socketDataIn: {},
        getPackets: false,
        trashClicked: 0,
        trashButtonText: "DELETE DEVICE",
        clearStateClicked: 0,
        eraseButtonText: "CLEAR STATE",
        sharebuttonText: "SHARE DEVICE",
        view: undefined,
        apiMenu: 1,
        isOpen: false,
        stats: {},
        tempstat: [],
        search: "",
        userSearched: "Search For users above",
        SelectedUsers: [],
        DeviceSharedEmails: [],
        EmailsharedDevice: [],
        display: "",
        EditorButton: " SHOW EDITOR",
        shareDisplay: "",
        editorChanged: false,
        devicesServer: undefined,
        shared: [],
        Devicestate: "SHARE PUBLICLY",
        DevicestateIcon: "fas fa-globe-africa",
        checkboxstate: "",
        qresponse: { mail: "failed" },
        show: " "
    };


    componentWillMount = () => {

    }

    componentDidMount = () => {
        Modal.setAppElement('body');
    }

    handleActionCall = (clickdata) => {
        var newEmailList = _.clone(this.state.userSearched)
        var temp = [];
        for (var dev in newEmailList) {
            if (newEmailList[dev] == clickdata) {
                if (clickdata.selected == "deselected") {
                    newEmailList[dev].selected = "selected";
                }
                else {
                    newEmailList[dev].selected = "deselected";
                }
                temp = newEmailList.filter((users) => { return users.selected !== "deselected" })
                this.state.SelectedUsers = _.clone(temp)
            }
        }
    }

    unshare = (remove) => {
        this.setState({ show: "noDisplayShare" });
        for (let i in this.state.userSearched) {
            if (remove == this.state.userSearched[i].uuid) {
                this.state.userSearched[i].shared = "no";
            }
        }
        fetch("/api/v3/unshare", {
            method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ removeuser: remove, dev: this.props.devid, })
        }).then(response => response.json()).then(stats => {
            this.setState({ stats: stats })
            this.setState({ qresponse: { mail: "sent" } })
            this.setState({ show: " " });
        }).catch(err => console.error(err.toString()));
    }

    setValues = (isOpen) => {
        if (isOpen == true && count == 0) {
            count++;
            fetch("/api/v3/stats", {
                method: "GET", headers: { "Accept": "application/json", "Content-Type": "application/json" }
            }).then(response => response.json()).then(stats => {
                this.setState({ stats: stats })

                Modal.setAppElement('body');
                fetch("/api/v3/state", {
                    method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
                    body: JSON.stringify({ id: this.props.devid, username: this.props.username })
                }).then(response => response.json()).then(state => {
                    this.setState({ state })

                    if (this.state.state.public == true) {
                        this.setState({ checkboxstate: "none" })
                        this.setState({ Devicestate: "UNSHARE PUBLICLY" })
                    }
                    this.sharedList();
                    this.setState({ devid: this.props.devid })
                }).catch(err => console.error(err.toString()));
            }).catch(err => console.error(err.toString()));
        }
    }

    search = evt => {
        this.setState({ search: evt.target.value.toString() }, () => {
            var temp = [];
            var newDeviceList = [];
            var statsl = this.state.stats.userList;
            statsl.map((person, i) => {
                temp = [...temp, person.email]
                if (person.email.toLowerCase().includes(this.state.search.toLowerCase())) {
                    newDeviceList.push(person);
                } else {
                    newDeviceList.push("|");
                }
            });
            temp = newDeviceList.filter((users) => { return users !== "|" && users.email !== this.props.account.email })
            for (var look in this.state.shared) {
                for (var i in temp) {
                    if (temp[i].uuid == this.state.shared[look]) {
                        temp[i].shared = "yes"
                    }
                }
            }
            this.setState({ userSearched: temp })
        })
    }

    userNameList = () => {

        try {
            return (<div style={{ height: "20%" }}>
                {
                    this.state.userSearched.map((user, i) => {
                        if (user.shared == "no") {
                            return <div id={user.email} key={i} className="commanderBgPanel commanderBgPanelClickable" style={{ display: this.state.checkboxstate }}>{user.email} <input type="checkbox" style={{ float: "right" }} onClick={(e) => this.handleActionCall(user)} /> </div>
                        }
                        else {
                            return <div id={user.email} key={i} className="commanderBgPanel commanderBgPanelClickable" style={{ display: this.state.checkboxstate }}>{user.email} <div style={{ float: "right" }} onClick={(e) => this.unshare(user.uuid)}>Revoke Sharing </div></div>
                        }
                    })
                }
            </div >)
        } catch (err) { }
    }


    emailsEmailedWith = () => {
        try {
            return (<div>
                {
                    this.state.EmailsharedDevice.map((user, i) => {
                        return <div id={user.email} className="" style={{ color: "rgb(127,255,0)" }}> |{user.email}|<input type="checkbox" style={{ float: "right" }} />  </div>
                    })
                }
            </div>)
        } catch (err) { }
    }

    sharedList = () => {
        fetch("/api/v3/shared", {

            method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify({ dev: this.state.devid, })
        }).then(response => response.json()).then(states => {

            if (states.access) {
                var shared = _.clone(states.access)
                this.setState({ shared })
            }
        })
    }

    ShareButton = () => {
        if (this.state.SelectedUsers.length > 0) {
            return (
                <div className="protoButton"
                    onClick={this.shareDevice} style={{ float: "right", cursor: "pointer" }}> <i className="fas fa-share-alt" /> SHARE DEVICE</div>
            )
        } else {
            return (
                <div className="protoButton" style={{ opacity: 0.3, cursor: "not-allowed", float: "right" }} ><i className="fas fa-share-alt" />  SHARE DEVICE</div>
            )
        }
    }

    shareDevice = () => {
        this.setState({ show: "noDisplayShare" });

        this.state.EmailsharedDevice = _.clone(this.state.SelectedUsers) //#region 
        for (let dev in this.state.EmailsharedDevice) {
            for (let i in this.state.userSearched) {
                if (this.state.EmailsharedDevice[dev].email == this.state.userSearched[i].email) {
                    this.state.userSearched[i].shared = "yes";
                }
            }
            fetch("/api/v3/admin/shareDevice", {
                method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: this.state.EmailsharedDevice[dev].email,
                    text: 'Hi a Device was shared with you called ' + this.props.devid,
                    html: '<p>Hi <br></br>' + this.props.username + ' has shared (' + this.props.devid + ') Device with you </p>',
                    subject: 'SHARED DEVICE',
                    dev: this.props.devid,
                    person: this.props.username
                })
            }).then(response => response.json()).then(serverresponse => {
                this.setState({ qresponse: serverresponse.result })
                this.setState({ show: " " });
            }).catch(err => console.error(err.toString()));
        }
        this.setState({ SelectedUsers: [] })
        this.setState({ isOpen: !this.state.isOpen })
    }


    publicOrprivate = () => {
        if (this.state.Devicestate == "SHARE PUBLICLY") {
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className='protoPopup' align="center">
                            <h1>Are you sure?</h1>
                            <p>This will make device visible to Anyone even unregistered vistors </p>
                            <button className="smallButton" style={{ margin: "5px" }} onClick={onClose}>No, Cancel it!</button>
                            <button className="smallButton" style={{ margin: "5px" }} style={{ margin: "15px" }} onClick={() => {
                                {
                                    fetch("/api/v3/makedevPublic", {
                                        method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            devid: this.state.state.key
                                        })
                                    }).then(response => response.json()).then(serverresponse => {
                                        { onClose() }
                                        this.setState({ checkboxstate: "none" })
                                        this.setState({ Devicestate: "UNSHARE PUBLICLY" })
                                    }).catch(err => console.error(err.toString()));
                                }
                            }}>Yes,Share Publicly!</button>
                        </div>
                    )
                }
            })
        }
        else if (this.state.Devicestate == "UNSHARE PUBLICLY") {
            fetch("/api/v3/makedevPrivate", {
                method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({
                    devid: this.state.state.key
                })
            }).then(response => response.json()).then(serverresponse => {
                this.setState({ checkboxstate: "" })
                this.setState({ Devicestate: "SHARE PUBLICLY" })
            }).catch(err => console.error(err.toString()));
        }
    }


    DevicePublic = () => {
        if (this.state.checkboxstate == "") {
            return (
                <div style={{ float: "right", cursor: "pointer" }} className="protoButton" onClick={this.publicOrprivate}><i className="fas fa-globe-africa" ></i> {this.state.Devicestate}</div>
            )
        }
        if (this.state.checkboxstate == "none") {
            return (
                <div style={{ float: "right", cursor: "pointer" }} className="protoButton" onClick={this.publicOrprivate}><i className="fa fa-eye-slash" ></i> {this.state.Devicestate}</div>
            )
        }
    }

    selectedUserCount = () => {
        if (this.state.SelectedUsers.length == 0) {
            return (
                <div></div>
            )
        }
        else {
            return (
                <div>SELECTED USERS ({this.state.SelectedUsers.length})</div>
            )
        }
    }



    render() {
        return (<div ><center>
            {this.setValues(this.props.isOpen)}
            <Modal style={customStyles} isOpen={this.props.isOpen} onRequestClose={this.toggle}><i className={"fas fa-times " + this.state.show} onClick={() => { this.props.closeModel(this.state.qresponse); count = 0; }} style={{ color: "red" }}></i>
                <center style={{ color: "white", display: this.state.checkboxstate }}>
                    <br></br> Search For users to share  with<br></br>
                    <div style={{ color: "white" }}><i className="fas fa-search" style={{ color: "white" }}></i> <input type="text" name="search" placeholder=" By email" onChange={this.search} /></div></center><br></br>
                <br></br>{this.DevicePublic()}<div>
                    {this.ShareButton()}</div><hr></hr>
                <div >{this.selectedUserCount()}</div> <hr></hr><br></br>                <div >
                    {this.userNameList()}
                </div>
                <center>
                    {/* <button>Share Device</button> */}
                </center>
            </Modal>
        </center>
        </div >)
    }
}

