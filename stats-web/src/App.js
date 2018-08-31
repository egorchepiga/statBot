import React, {Component} from 'react';
import {connect} from 'react-redux';
import './App.css';
import {createSummaryGraphic} from './store/graphics/summary/action'
import {createTopWordsForChat} from './store/graphics/top/action'
import {createTimeMessage} from './store/graphics/time/action'
import {loadChats} from './services/stats';
import {saveChat, loadChat, loadUserWords, updateBannedWords} from "./store/chat/action";
import {setToken} from './store/getStats/token/action'
import {calculateTimeScale} from "./common/timeHelpers";
import Button from './components/button';
import SummaryGraphic from './containers/summary';
import TopGraphic from './containers/top';
import TimeMessageGraphic from './containers/time';

class App extends Component {

    constructor(props) {
        super(props);
        let token = new URL(window.location).searchParams.get("token");
        this.props.setToken(token);
        this.props.getChats({token});
    }

    setChat = (event) => {
        this.props.setChat({token : this.props.store.token, chat_id : event.target.id});
    };

    createButton = (id, label) => (
        <Button key={id}
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

    shouldComponentUpdate(props){
        return props.store.stats.length !== 0
    }

    render() {
        return (
            <div className="App">
                <div>
                    <div>
                        {this.createButtons()}
                    </div>
                    <div>
                        <SummaryGraphic/>
                        <TopGraphic/>
                        <div>
                            <TimeMessageGraphic/>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
}

export default connect(
    state => ({
        store: state
    }),
    dispatch => ({
        setToken: (token) => {
            dispatch(setToken(token));
        },
        getChats: ({token}) => {
            dispatch(loadChats({token}))
        },
        setChat: ({token, chat_id}) => {
            dispatch(loadChat({token, chat_id}))
                .then(data => {
                    dispatch(createSummaryGraphic(data));
                    dispatch(createTopWordsForChat(data));
                    dispatch(createTimeMessage(data.timeReady,'0',0,0,0, calculateTimeScale(data.timeReady[0])));
                });

        }
    })
)(App);
