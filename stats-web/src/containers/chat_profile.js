import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createTopWordsForChat} from "../store/graphics/top/action";
import {createTopStickers} from "../store/graphics/stickers_top/action";
import {setChosen} from "../store/getStats/chosen/action";
import {createTimeMessage} from "../store/graphics/time/action";

const TELEGRAM_ICON = 'https://egorchepiga.ru/tg.gif';

class ChatProfile extends Component {

    chooseUser = () => {
        this.props.chooseUser(false);
        this.props.createTopWords(
            this.props.store.chat,
            !this.props.store.topWordsForChat.forChat
        );
        this.props.createTopStickers(this.props.store.chat, !this.props.store.stickers.forChat);
        this.props.createTimeMessage(
            this.props.store.chat.timeReady,
            this.props.store.timeMessage.dayScale,
            this.props.store.timeMessage.imposition,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime,
            this.props.store.timeMessage.timeScale,
            this.props.store.timeMessage.average,
            this.props.store.timeMessage.periods,
            this.props.store.timeMessage.messageActivity,
            false,
            [],
            this.props.store.chat.theme
        );
    };



    render() {

        let img = this.props.store.chat.chat.img;
        let chosen = !this.props.store.chosen ? ' chosen ' + this.props.store.chat.theme+"Img" : "";
        return (
            <div className="chat-info" onClick={this.chooseUser}>
                <div className="chat-info__chatname">
                    <b>{this.props.store.chat.name}</b>
                </div>
                <div className="chat-info-container">
                <div className={"chat-info__photo" + chosen}>
                    <img src={img !== null && img !== undefined && img.indexOf('file') !== -1 ? 'https://egorchepiga.ru/tg-stats/' + img : TELEGRAM_ICON}/>
                </div>
                <div className="chat-info-label" >
                    <div className="chat-info-more">
                        <div className="row">
                            <label className="title col-9 col-sm-9 col-md-9 col-lg-9 col-xl-9">{this.props.store.locale.chat_profile.msg}</label>
                            <label className="col-3 col-sm-3 col-md-3 col-lg-3 col-xl-3">{this.props.store.token.token === 'demo' ? '254' :this.props.store.chatProfile.count}</label>
                        </div>
                        <div className="row">
                            <label className="title col-9 col-sm-9 col-md-9 col-lg-9 col-xl-9">{this.props.store.locale.chat_profile.active}</label>
                            <label className="col-3 col-sm-3 col-md-3 col-lg-3 col-xl-3">{this.props.store.token.token === 'demo' ? '5' :this.props.store.chatProfile.users }</label>
                        </div>
                        <div className="row">
                            <label className="title col-9 col-sm-9 col-md-9 col-lg-9 col-xl-9">{this.props.store.locale.chat_profile.pick}</label>
                            <label className="col-3 col-sm-3 col-md-3 col-lg-3 col-xl-3">{this.props.store.token.token === 'demo' ? '12:00' : this.props.store.chatProfile.pickHour }</label>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        )
    }

}

export default connect(state => ({
        store: state
    }), dispatch => ({
    chooseUser :  (chosen) => {
        dispatch(setChosen(chosen))
    },
    createTopWords: (data, forChat) => {
        dispatch(createTopWordsForChat(data, forChat));
    },
    createTopStickers: (data, forChat) => {
        dispatch(createTopStickers(data, forChat));
    },
    createTimeMessage: (time, dayScale, imposition, fromTime, toTime, customScale, average, periods, messagesActivity, chosen, RAW, theme) => {
        dispatch(createTimeMessage(time, dayScale, imposition, fromTime, toTime, customScale, average, periods, messagesActivity, chosen, RAW, theme))
    }
    })
)(ChatProfile)