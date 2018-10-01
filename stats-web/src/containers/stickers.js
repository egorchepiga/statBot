import React, {Component} from 'react';
import {connect} from 'react-redux';
import Button from '../components/button';
import {HorizontalBar} from 'react-chartjs-2';
import {createTopStickers} from "../store/graphics/stickers_top/action";
import SwitchButton from "../components/switchbutton"

const TELEGRAM_ICON = 'https://egorchepiga.ru/tg.gif';

class Stickers extends Component {

    topStickers = () => {
        return (
            <div className="stickers-holder">
                {this.props.store.stickers.stickers.map(this.stickerImage)}
            </div>
        )
    };

    stickerImage = (src, index) => {
        let img = src.sticker;
        return (
        index < 5 ? <img key={src.sticker} className="thumbnail img-mock"
                         src={img !== null  && img.indexOf('file') !== -1 ? 'https://egorchepiga.ru/tg-stats/' + img : TELEGRAM_ICON}/> : ""
    )};

    createHeader = (label) => (
        <div className="header__most-active">
            <b>{label}</b>
        </div>
    );

    changeForChat = () => {
        let chat = {
            ...this.props.store.chat,
            theme : this.props.store.stickers.theme
        };
        this.props.createStickersTop(
            chat,
            !this.props.store.stickers.forChat,
            this.props.store.chosen
        )
    };

    forChatSwitcher = () => (
        <SwitchButton
            className="stickers-switch"
            labelLeft="average" labelRight="users"
            key="stickersSwitcher"
            id="stickersSwitcher"
            action={this.changeForChat}
            isChecked={!this.props.store.stickers.forChat}
            theme={this.props.store.stickers.theme}
        />
    );

    render() {
        let visibility = this.props.store.stickers.data;
        return (
            <div className="graphich__second graphich__wrapper col-sm-12 col-md-10 col-lg-10 col-xl-9">
                {visibility && this.createHeader('Top stickers')}
                {visibility && !this.props.store.chosen && this.forChatSwitcher()}
                <div>
                    {visibility && this.topStickers()}
                    {visibility && (
                        <div className="stickers-bar-holder">
                            <div>
                            <HorizontalBar
                                data={this.props.store.stickers.data}
                                options={this.props.store.stickers.options}
                            />
                            </div>
                        </div>
                    ) }
                </div>
            </div>
        )
    }
}

export default connect(state => ({
        store: state
    }), dispatch => ({
    createStickersTop : (data, forChat) => {
        dispatch(createTopStickers(data, forChat))
    }
    })
)(Stickers)