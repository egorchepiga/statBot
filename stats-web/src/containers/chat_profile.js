import React, {Component} from 'react';
import {connect} from 'react-redux';
import {createTopWordsForChat} from "../store/graphics/top/action";
import {createTopStickers} from "../store/graphics/stickers_top/action";
import {setChosen} from "../store/getStats/chosen/action";
import {createTimeMessage} from "../store/graphics/time/action";

const TELEGRAM_ICON = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/1200px-Telegram_logo.svg.png';

class ChatProfile extends Component {

    chooseUser = () => {
        this.props.chooseUser(false);
        this.props.createTopWords(
            this.props.store.chat,
            this.props.store.topWordsForChat.forChat
        );
        this.props.createTopStickers(this.props.store.chat, this.props.store.stickers.forChat);
        this.props.createTimeMessage(
            this.props.store.chat.timeReady,
            this.props.store.timeMessage.dayScale,
            this.props.store.timeMessage.imposition,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime,
            this.props.store.timeMessage.timeScale,
            this.props.store.timeMessage.average,
            this.props.store.timeMessage.periods,
            this.props.store.timeMessage.messageActivity
        );
    };

    render() {
        let img = this.props.store.chat.chat.img;
        return (
            <div className="chat-profile" onClick={this.chooseUser}>
                <img className="chat-image"
                     src={img !== null  && img.indexOf('file') !== -1 ? 'https://egorchepiga.ru/tg-stats/' + img : TELEGRAM_ICON}
                />
                <div className="chat-profile-info">
                    <label>{this.props.store.chat.name}</label>
                    <div className="chat-profile-stats">
                        <label>{'Messages today: ' + this.props.store.chatProfile.count}</label>
                        <label>{'Active users today: ' + this.props.store.chatProfile.users}</label>
                        <label>{'Pick hour: ' + this.props.store.chatProfile.pickHour }</label>
                    </div>
                </div>
            </div>)
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
    createTimeMessage: (time, dayScale, imposition, fromTime, toTime, customScale, average, periods, messagesActivity) => {
        dispatch(createTimeMessage(time, dayScale, imposition, fromTime, toTime, customScale, average, periods, messagesActivity))
    }
    })
)(ChatProfile)