import React, {Component} from 'react';
import {connect} from 'react-redux';
import GraphicBar from '../components/bar';
import Button from '../components/button';
import {createTopWordsForChat} from "../store/graphics/top/action";

class TopGraphic extends Component {

    createHeader = (label) => (
        <div className="header__most-active">
            <b>{label}</b>
        </div>
    );

    changeForchat = () => {
        this.props.createSecondGraphic(
            this.props.store.chat,
            !this.props.store.topWordsForChat.forChat
        )
    };

    forChatSwitcher = () => (
        <Button className="btn btn-outline-primary btn-sm col-sm-12 col-md-2 col-lg-2 col-xl-2"
                key="201"
                id="201"
                label="users"
                onClick={this.changeForchat}
                active={this.props.store.topWordsForChat.forChat}
        />
    );

    render() {
        let visibility = this.props.store.topWordsForChat.data;
        return (
            <div className="graphich__second graphich__wrapper col-sm-12 col-md-10 col-lg-9 col-xl-7">
                <div className="chartjs-size-monitor">
                    {visibility && this.createHeader('Top words')}
                    {visibility && this.forChatSwitcher()}
                    <GraphicBar data={this.props.store.topWordsForChat.data}
                                 options={this.props.store.topWordsForChat.options}/>
                </div>
            </div>)
    }
}

export default connect(state => ({
        store: state
    }), dispatch => ({
        createSecondGraphic : (data, forChat) => {
            dispatch(createTopWordsForChat(data, forChat))
        }
    })
)(TopGraphic)