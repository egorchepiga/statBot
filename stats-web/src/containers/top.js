import React, {Component} from 'react';
import {connect} from 'react-redux';
import GraphicBar from '../components/bar';
import {createTopWordsForChat} from "../store/graphics/top/action";
import SwitchButton from "../components/switchbutton"
class TopGraphic extends Component {

    createHeader = (label) => (
        <div className="header__most-active">
            <b>{label}</b>
        </div>
    );

    changeForchat = () => {
        let chat = {
            ...this.props.store.chat,
            theme : this.props.store.topWordsForChat.theme
        };
        this.props.createSecondGraphic(
            chat,
            !this.props.store.topWordsForChat.forChat,
            this.props.store.chosen
        )
    };

    forChatSwitcher = () => (
        <SwitchButton
            className={"words-switch "+this.props.store.locale.locale}
            id="topWordsSwitcher"
            isChecked={!this.props.store.topWordsForChat.forChat}
            labelLeft={this.props.store.locale.top_words.common}
            labelRight={this.props.store.locale.top_words.users}
            action={this.changeForchat}
            theme={this.props.store.topWordsForChat.theme}
        />
    );

    render() {
        let visibility = this.props.store.topWordsForChat.data;
        return (
            <div className="graphich__second graphich__wrapper col-sm-12 col-md-10 col-lg-10 col-xl-9">
                {visibility && <div className="chartjs-size-monitor">
                    {this.createHeader(this.props.store.locale.top_words.header)}
                    {!this.props.store.chosen && this.forChatSwitcher()}
                    <GraphicBar data={this.props.store.topWordsForChat.data}
                                 options={this.props.store.topWordsForChat.options}/>
                </div>}

            </div>)
    }
}

export default connect(state => ({
        store: state
    }), dispatch => ({
        createSecondGraphic : (data, forChat, chosen) => {
            dispatch(createTopWordsForChat(data, forChat, chosen))
        }
    })
)(TopGraphic)