import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import Media from "react-media";
import Modal from 'react-modal';

var searchButton = "icon"
Modal.setAppElement('body')
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
export class StatesViewerMenu extends Component {
    constructor() {
        super();
        this.state = { selectAll: false, sort: "", menu: "", view: "map", addIcon: "fas fa-plus-circle", display: "", showAddDevice: "none", addDeviceButton: "none", ssid: "", wifipass: "", code: [], modalIsOpen: false }
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }


    selectBox = () => {
        if (this.props.public == false) {
            if (this.props.visiting == false) {
                if (this.state.selectAll) {
                    return (<i className="fas fa-check-square" onClick={this.selectBoxClickHandler(false)} title="Deselect All" ></i>)
                } else {
                    return (<i className="far fa-square" onClick={this.selectBoxClickHandler(true)} title="Select All" ></i>)
                }
            }
        }
    }

    selectBoxClickHandler = (action) => {
        return (e) => {
            this.setState({ selectAll: action })
            this.props.selectAll(action)
        }
    }

    sortButtons = () => {
        if (this.state.sort == "") { return <i className="stateSortButton fas fa-sort-amount-down" title="latest created top" onClick={this.sortClickHandler("timedesc")} ></i> }
        if (this.state.sort == "timedesc") { return <i className="stateSortButton fas fa-sort-numeric-down" title="last seen top" onClick={this.sortClickHandler("namedesc")} ></i> }
        if (this.state.sort == "namedesc") { return <i className="stateSortButton fas fa-sort-alpha-down" title="alphabetical" onClick={this.sortClickHandler("")} ></i> }
    }

    sortClickHandler = (action) => {
        return (e) => {
            this.setState({ sort: action })
            this.props.sort(action);
        }
    }

    menuDeleteButton = () => {
        if (this.props.public == false) {
            if (this.props.visiting == false) {
                if (this.props.selectCount > 0) {
                    return (
                        <div className="protoButton protoButtonClickable" style={{ float: "left", marginRight: 10 }} title={this.props.selectCount + " selected."}
                            onClick={() => this.clickDeleteConfirmation()}> <i className="fas fa-trash" /> DELETE</div>
                    )
                } else {
                    return (
                        <div className="protoButton" style={{ float: "left", marginRight: 10, opacity: 0.3, cursor: "not-allowed", display: this.state.menu }} title="Select some devices first..."> <i className="fas fa-trash" /> DELETE</div>
                    )
                }
            }
        }
    }

    viewButton = () => {
        if (this.state.view == "list") {
            return <i className="viewButton fas fa-map-marked-alt" title="Map View" style={{ color: "grey", marginTop: "10px", cursor: "pointer" }} onClick={this.viewButtonClicked("map")} ></i>;
        } else if (this.state.view == "map") {
            return <i className="viewButton fas fa-list-ul" title="List View" style={{ color: "grey", marginTop: "10px" }} onClick={this.viewButtonClicked("list")} ></i>;
        }
    }


    viewButtonClicked = (action) => {
        return (e) => {
            this.setState({ view: action })
            this.props.view(action);
        }
    }

    clickDeleteConfirmation = () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='protoPopup' align="center">
                        <h1>Are you sure?</h1>
                        <p>Deleting a device is irreversible</p>
                        <div >
                            <button className="smallButton" style={{ margin: "5px", backgroundColor: "red", opacity: "0.7" }} onClick={onClose}>No, leave it!</button>

                            <button className="smallButton" style={{ margin: "5px", backgroundColor: "green", opacity: "0.6" }} onClick={() => {
                                //this.handleClickDelete()
                                this.props.deleteSelected()
                                onClose()
                            }}>Yes, delete it!</button>
                        </div>
                    </div>
                )
            }
        })
    };

    dialog() {
        if (this.state.dialog) {
            return (
                <div className="container" style={{ color: "red" }}>
                </div>
            );
        }
    }

    inputDeviceShow = () => {
        if (this.state.showAddDevice == "none") {
            this.setState({ menu: "none" })
            this.setState({ addIcon: "fas fa-minus-circle" })
            this.setState({ showAddDevice: "" })
        }
        else if (this.state.showAddDevice == "") {

            this.setState({ menu: "" })
            this.setState({ addIcon: "fas fa-plus-circle" })
            this.setState({ showAddDevice: "none" })
        }
    }

    ssid = (ssid) => {
        return (evt) => {
            this.setState({ ssid: evt.target.value })
        }
    }

    wifiPassword = (wifipass) => {
        return (evt) => {
            this.setState({ wifipass: evt.target.value })
        }
    }
    bits = () => {
        var data = Buffer.from(JSON.stringify({ wifi: { ssid: this.state.ssid, pass: this.state.wifipass } }))

        for (var a = 0; a < data.length; a++) {
            var byte = data[a].toString(2)
            for (var b = 0; b <= 8 - byte.length; b++) {
                byte = "0" + byte;
            }
            this.state.code.push(byte)
        }
        this.openModal()
    }

    addButton = () => {
        if (window.innerWidth > 667) {
            if (this.state.wifipass == "" || this.state.ssid == "") {
                return (
                    <div className="protoButton" style={{ width: "15%", float: "right", marginLeft: "2%", cursor: "not-allowed", opacity: "0.4", textAlign: "center" }}>ADD DEVICE</div>
                )
            }
            else {
                return (
                    <div className="protoButton protoButtonClickable" style={{ width: "15%", float: "right", marginLeft: "2%", textAlign: "center" }} onClick={this.bits}>ADD DEVICE</div>
                )
            }
        }

        else if (window.innerWidth < 667) {
            if (this.state.wifipass == "" || this.state.ssid == "") {
                return (
                    <div className="protoButton" style={{ marginTop: "30px", width: "50%", float: "right", cursor: "not-allowed", opacity: "0.4", marginLeft: "400px", textAlign: "center" }}>ADD DEVICE</div>
                )
            }
            else {
                return (
                    <div className="protoButton protoButtonClickable" style={{ marginTop: "30px", width: "50%", float: "right", textAlign: "center", marginLeft: "400px", textAlign: "center" }} onClick={this.bits}>ADD DEVICE</div>
                )
            }
        }
    }

    addDevice = () => {
        if (window.innerWidth > 667) {
            return (
                <div><i className={this.state.addIcon} style={{ marginTop: "12px", color: "red", cursor: "pointer" }} onClick={this.inputDeviceShow}></i>
                    <div style={{ float: "right", display: this.state.showAddDevice, width: "95%" }}>WIFI ssid:<input type="text" name="ssid" onChange={this.ssid("ssid")} style={{ width: "25%", marginRight: "5px" }} required />
                        WIFI password: <input name="wifipass" type="text" style={{ width: "25%", marginRight: "5px" }} onChange={this.wifiPassword("wifipass")} required />{this.addButton()}</div>
                </div >
            )
        }
        else if (window.innerWidth < 667) {
            return (
                <div><i className={this.state.addIcon} style={{ color: "red", cursor: "pointer", position: "absolute", marginLeft: "20px", paddingBottom: "800px" }} onClick={this.inputDeviceShow} /><br></br>
                    <div style={{ display: this.state.showAddDevice, width: "95%" }}> <div>WIFI ssid:<input type="text" name="ssid" onChange={this.ssid("ssid")} style={{ width: "50%", float: "right" }} required /></div><br></br>
                        WIFI password: <input name="wifipass" type="text" style={{ width: "50%", float: "right" }} onChange={this.wifiPassword("wifipass")} required /><br></br>{this.addButton()}</div>
                </div >
            )
        }
    }

    changeSearch = () => {
        if (searchButton == "icon") {
            searchButton = "filter"
            this.setState({ display: "menuIcons" })
        } else if (searchButton == "filter") {
            searchButton = "icon"
            this.setState({ display: "" })
        }
    }

    openModal() {
        this.setState({ modalIsOpen: true });
    }

    closeModal() {
        this.setState({ modalIsOpen: false });
        this.setState({ code: [] })
    }

    changeClass = () => {
        if (searchButton == "icon") {
            return (
                <i onClick={this.changeSearch} className="fas fa-search"></i>
            )
        } else if (searchButton == "filter") {
            return (
                <div style={{ padding: 0 }}>
                    <i onClick={this.changeSearch} className="fas fa-search searchIcon"></i>
                    <form id="search" style={{ textAlign: "left" }} style={{ width: "92%", float: "right" }}>
                        <input name="query" type="search" onChange={this.props.search} style={{ width: "100%" }} />
                    </form>
                </div>
            )
        }
    }

    code = () => {
        try {
            return (<div style={{ height: "10%" }}>
                {
                    this.state.code.map((user, i) => {
                        return <div id={user} key={i} className="commanderBgPanel" style={{ float: "center" }}>{user}</div>
                    })
                }
            </div >)
        } catch (err) { }
    }

    render() {
        return (
            < div className="container-fluid protoMenu" >
                <Media query="(max-width: 599px)">
                    {matches =>
                        matches ? (
                            <div className="row" style={{ padding: 5 }} >
                                <span>
                                    <div className="col" style={{ flex: "0 0 35px", padding: "10px 0 0 10px", display: this.state.menu }}>
                                        {this.selectBox()}
                                    </div>
                                </span>

                                <span>


                                    <div className="col" style={{ flex: "0 0 300px", padding: "10px 10px 0 12px", display: this.state.menu }}>
                                        {this.changeClass()}
                                    </div >
                                </span >

                                <span className={this.state.display} style={{ width: "80%", float: "right" }}>
                                    <span className="col" >
                                        {this.menuDeleteButton()}
                                        {/* { this.props.selectCount} */}
                                    </span>

                                    <span className="col" style={{ flex: "0 0 10px" }}>
                                        <div style={{ float: "right", marginLeft: "20px", display: this.state.menu }}>{this.viewButton()}</div>
                                        <div style={{ textAlign: "right", float: "right", marginTop: "7px", width: "20px", display: this.state.menu }}>
                                            {this.sortButtons()}
                                        </div>
                                        <Modal
                                            isOpen={this.state.modalIsOpen}
                                            onRequestClose={this.closeModal}
                                            style={customStyles}
                                            contentLabel="Example Modal"                                >
                                            <i className="fas fa-times" onClick={this.closeModal} style={{ color: "red" }} />
                                            {this.code()}
                                        </Modal>
                                    </span>
                                    {this.addDevice()}
                                </span>
                            </div >
                        ) : (
                                <div className="row" style={{ padding: 5 }} >
                                    <div className="col" style={{ flex: "0 0 35px", padding: "10px 0 0 10px", display: this.state.menu }}>
                                        {this.selectBox()}
                                    </div>

                                    <div className="col" style={{ flex: "0 0 300px", padding: 0, display: this.state.menu }}>
                                        <form id="search" style={{ textAlign: "left" }} style={{ width: "100%" }}>
                                            <input name="query" type="search" onChange={this.props.search} placeholder="by device name or email..." style={{ width: "100%" }} />
                                        </form>
                                    </div>

                                    <div className="col" style={{ flex: "0 0 70px", display: this.state.menu }}>
                                        {this.viewButton()}
                                        <div style={{ float: "left", marginTop: "7px", textAlign: "left", width: "20px" }}>
                                            {this.sortButtons()}
                                        </div>
                                    </div>

                                    <div className="col">
                                        {this.menuDeleteButton()}
                                        {this.addDevice()}
                                    </div>
                                    <Modal
                                        isOpen={this.state.modalIsOpen}
                                        onRequestClose={this.closeModal}
                                        style={customStyles}
                                        contentLabel="Example Modal"                               >
                                        <i className="fas fa-times" onClick={this.closeModal} style={{ color: "red" }} /><br></br>
                                        {this.code()}
                                    </Modal>
                                </div>
                            )
                    }
                </Media>
            </div >
        )
    }
}
