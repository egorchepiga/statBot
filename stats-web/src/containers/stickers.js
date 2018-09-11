import React, {Component} from 'react';
import {connect} from 'react-redux';
import Button from '../components/button';
import {HorizontalBar} from 'react-chartjs-2';
import {createTopStickers} from "../store/graphics/stickers_top/action";

class Stickers extends Component {

    topStickers = () => {
        return (
            <div className="stickers-holder">
                {this.props.store.stickers.stickers.map(this.stickerImage)}
            </div>
        )
    };

    stickerImage = (src, index) => (
        index < 5 ? <img key={src.sticker} className="img-mock" src={'https://egorchepiga.ru/tg-stats/'+src.sticker}/> : ""
    );

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