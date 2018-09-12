import React, {Component} from 'react';
import {connect} from 'react-redux';
import Button from '../components/button';
import {HorizontalBar} from 'react-chartjs-2';
import {createTopStickers} from "../store/graphics/stickers_top/action";

const TELEGRAM_ICON = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/1200px-Telegram_logo.svg.png';

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
        index < 5 ? <img key={src.sticker} className="img-mock"
                         src={img !== null  && img.indexOf('file') !== -1 ? 'https://egorchepiga.ru/tg-stats/' + img : TELEGRAM_ICON}/> : ""
    )};

    createHeader = (label) => (
        <div className="header__most-active">
            <b>{label}</b>
        </div>
    );

    changeForChat = () => {
        this.props.createStickersTop(
            this.props.store.chat,
            !this.props.store.stickers.forChat,
            this.props.store.chosen
        )
    };

    forChatSwitcher = () => (
        <Button className="btn btn-outline-primary btn-sm col-sm-12 col-md-2 col-lg-2 col-xl-2"
                key="201"
                id="201"
                label="users"
                onClick={this.changeForChat}
                active={!this.props.store.stickers.forChat}
        />
    );

    render() {
        let visibility = this.props.store.stickers.data;
        return (
            <div className="graphich__second graphich__wrapper col-sm-12 col-md-10 col-lg-9 col-xl-7">
                {visibility && this.createHeader('Top stickers')}
                {visibility && this.forChatSwitcher()}
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