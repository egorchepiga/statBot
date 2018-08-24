import React, {Component} from 'react';
import {connect} from 'react-redux';
import './App.css';

import {createSummaryGraphic} from './store/graphics/summary/action'
import {createTopWordsForChat} from './store/graphics/top/action'
import {createTimeMessage} from './store/graphics/time/action'
import {setChat} from './store/chat/action';
import {getAll} from './services/stats';
import {setToken} from './store/getStats/token/action'
import SummaryGraphic from './containers/summary';
import TopGraphic from './containers/top';
import TimeMessageGraphic from './containers/time';
import {calculateTimeScale} from "./common/timeHelpers";


class App extends Component {

    componentWillMount(){
        let token = new URL(window.location).searchParams.get("token");
        this.props.setToken(token);
        this.getStats(token);
    };

    getStats = (token) => {
        this.props.get({token: token});
    };

    setChat = (event) => {
        this.props.setChat(event.target.id);
        this.props.setDataFirstGraphic(this.props.store.stats[event.target.id]);                               //создаем первый график
        this.props.setDataSecondGraphic(this.props.store.stats[event.target.id]);                              //создаем второй график

        let timeScale = calculateTimeScale(this.props.store.stats[event.target.id].timeReady[0]);
        this.props.setDataThirdGraphic(this.props.store.stats[event.target.id].timeReady,'0',0,0,0,timeScale); //создаем третий график
    };

    render() {
        return (
            <div className="App">
                <div>
                    <div>
                        {(this.props.store.stats.length > 0) ? this.props.store.stats.map((chat, i) => {
                            return <button key={i} onClick={this.setChat} id={i}>{chat.name}</button>
                        }) : null}
                    </div>
                    <SummaryGraphic/>
                    <TopGraphic/>
                    <div>
                    <TimeMessageGraphic/>
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
        setChat: (id) => {
            dispatch(setChat(id))
        },
        setDataFirstGraphic: (data) => {
            dispatch(createSummaryGraphic(data))
        },
        setDataSecondGraphic: (data) => {
            dispatch(createTopWordsForChat(data))
        },
        setDataThirdGraphic: (time, scale, brutal, fromTime, toTime, customScale) => {
            dispatch(createTimeMessage(time, scale, brutal, fromTime, toTime, customScale))
        },
        get: ({id, token, fromTime, toTime}) => {
            dispatch(getAll({id, token, fromTime, toTime}));
        }
    })
)(App);
