import React, { Component } from "react";
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHdd } from '@fortawesome/free-solid-svg-icons'
library.add(faHdd)
import { gridstyle, cellstyle, gridHeadingStyle, blockstyle, formRowStyle, formLabelStyle, formInputStyle } from "../../styles.jsx"

export const name = "Discord";

export class SettingsPanel extends React.Component {
    state = { form: { token: "", channelId: "", clientid: "yourClientID" }, bots: [] };

    componentDidMount = () => {
        fetch('/api/v3/discord/bots').then(response => response.json()).then((bots) => {
            this.setState({ bots })
        }).catch(err => console.error(err.toString()))
    }


    changeInput = (name) => {
        return (evt) => {
            var form = { ...this.state.form }
            form[name] = evt.target.value
            this.setState({ form })
        }
    }



    saveBot = () => {
        console.log(this.state.form);
        fetch('/api/v3/discord/savebot', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(this.state.form)
        }).then(response => response.json()).then((data) => {
            console.log(data);
            //if (this.props.update) { this.props.update(); }
        }).catch(err => console.error(err.toString()))

    }


    render() {
        return (
            <div>
                <div style={blockstyle}>
                    <h4>DISCORD</h4>
                    <p>
                        To add a bot go <a href="https://discordapp.com/developers/applications/">create an application on discord</a>.<br />
                        Copy paste the CLIENT ID.<br />
                        Then click on Bot on the left handside on discord and click Add bot.<br />
                    </p>

                    <div className="row" style={formRowStyle} >
                        <div className="col-4" style={formLabelStyle} >
                            CLIENT ID:
                    </div>
                        <div className="col-8" style={formInputStyle}>
                            <input
                                style={{ width: "100%" }}
                                placeholder={this.state.form.clientid}
                                onChange={this.changeInput("clientid")}
                                autoFocus={true}
                            />
                        </div>
                    </div>

                    <div className="row" style={formRowStyle} >
                        <div className="col-12" >
                            Then click the link below to add your bot to your server.<br />
                            {/* <a href={"https://discordapp.com/oauth2/authorize?client_id="+this.state.form.clientid+"&scope=bot&permissions=3072"}></a>. */}
                            <a href={"https://discordapp.com/oauth2/authorize?client_id=" + this.state.form.clientid + "&scope=bot&permissions=3072"}>{"https://discordapp.com/oauth2/authorize?client_id=" + this.state.form.clientid + "&scope=bot&permissions=3072"}</a>
                        </div>
                    </div>

                    <div className="row" style={{ marginTop: 30 }} ></div>

                    <div className="row" style={formRowStyle} >
                        <div className="col-4" style={formLabelStyle} >
                            Token:
                    </div>
                        <div className="col-8" style={formInputStyle}>
                            <input
                                style={{ width: "100%" }}
                                placeholder={this.state.form.token}
                                onChange={this.changeInput("token")}

                            />
                        </div>
                    </div>


                    <div className="row" style={formRowStyle} >
                        <div className="col-4" style={formLabelStyle} ></div>

                        <div className="col-6" style={formInputStyle}>
                            <div className="commanderBgPanel commanderBgPanelClickable"
                                style={{ width: 160 }}
                                onClick={this.saveBot}>
                                <FontAwesomeIcon icon="hdd" /> SAVE BOT</div>

                        </div>
                    </div>



                </div>


                <div style={blockstyle}>
                    <div className="row" style={gridHeadingStyle}>
                        <div className="col-12" style={{}}>Token</div>

                    </div>
                    {
                        this.state.bots.map((bot, i) => {
                            return (
                                <div key={bot._id} className="row" style={gridstyle}>{bot.token}</div>
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}
