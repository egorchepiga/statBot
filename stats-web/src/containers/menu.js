import React, {Component} from 'react';
import {connect} from 'react-redux';
import Button from '../components/button';
import {createTimeMessage} from "../store/graphics/time/action";
import {createTopWordsForChat} from "../store/graphics/top/action";
import {loadChat} from "../store/chat/action";
import {calculateTimeScale} from "../common/timeHelpers";
import {createSummaryGraphic} from "../store/graphics/summary/action";

class Menu extends Component {

    setChat = (event) => {
        this.props.setChat({token : this.props.store.token, chat_id : event.target.id});
    };

    createButton = (id, label) => (
        <Button className="btn btn-outline-primary btn col-11"
                key={id}
                id={id}
                label={label}
                onClick={this.setChat}
        />
    );

    createButtons = () => {
        let arr = [];
        for (let key in this.props.store.stats)
            arr.push(this.createButton(key, this.props.store.stats[key]));
        return arr;
    };


    render() {
       return (
            <nav id="menu" className="slideout-menu slideout-menu-left">
                <div className="menu__label">
                    <b className="text-primary">Выберите чат из списка доступных</b>
                </div>
                <div className="menu__btn">
                    {this.createButtons()}
                </div>
            </nav>
       )
    }
}


export default connect(state => ({
        store: state
    }), dispatch => ({
    setChat: ({token, chat_id}) => {
        dispatch(loadChat({token, chat_id}))
            .then(data => {
                dispatch(createSummaryGraphic(data));
                dispatch(createTopWordsForChat(data));
                dispatch(createTimeMessage(data.timeReady,'0',0,0,0, calculateTimeScale(data.timeReady[0])));
            });

    }
    })
)(Menu)