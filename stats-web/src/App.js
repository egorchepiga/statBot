import React, {Component} from 'react';
import {connect} from 'react-redux';
import './App.css';
import {loadChats} from './store/all/action';
import {setToken} from './store/getStats/token/action'
import {changeActive} from "./store/menu/action";
import SummaryGraphic from './containers/summary';
import TopGraphic from './containers/top';
import TimeMessageGraphic from './containers/time';
import Stickers from './containers/stickers';
import SlideMenu from './components/Menu/Menu'
import Button from './components/button';
import {createTimeMessage} from "./store/graphics/time/action";
import {createTopWordsForChat} from "./store/graphics/top/action";
import {loadChat} from "./store/chat/action";
import {calculateTimeScale} from "./common/timeHelpers";
import {createSummaryGraphic} from "./store/graphics/summary/action";
import {createTopStickers} from "./store/graphics/stickers_top/action";

class App extends Component {

    constructor(props) {
        super(props);
        let token = new URL(window.location).searchParams.get("token");
        this.props.setToken(token);
        this.props.getChats({token});
    }

    selectChatButton = () => (
        <div className="slideout-menu-wrapper">
        <button onClick={this.props.changeActive}
                className="toggle-button btn btn-primary slideout-menu">
            <div className="d-block d-sm-none">☰</div>
            <div className="d-none d-sm-block">Выбрать чат</div>
        </button>
        </div>
    );

    createButton = (id, label) => (
        <Button className="btn btn-outline-primary btn col-11"
                key={id}
                id={id}
                label={label}
                onClick={this.setChat}
                active={this.props.store.chat ? this.props.store.chat.id === id.toString() : false}
        />
    );

    setChat = (event) => {
        this.props.setChat({token : this.props.store.token, chat_id : event.target.id});
        this.props.changeActive();
    };

    createNavigationComponents = (items) => {
        let arr = [];
        for (let key in items){
            arr.push(this.createButton(key, items[key]))
        }
        return arr;
    };

    shouldComponentUpdate(props){
        return props.store.stats.length !== 0
    }

    render() {
        return (
            <SlideMenu
                active={this.props.store.menu.active}
                nav={this.createNavigationComponents(this.props.store.stats)} >
                <div className="App">
                    <main id="panel" className="slideout-panel slideout-panel-left">
                        {this.selectChatButton()}
                        <div className="wrapper container">
                            <div className="graphich__wrapper_column">
                                <div className="graphich__wrapper_row row justify-content-center">
                                    <SummaryGraphic/>
                                    <TopGraphic/>
                                    <Stickers/>
                                    <TimeMessageGraphic/>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </SlideMenu>
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
        changeActive: () => {
            dispatch(changeActive())
        },
        setChat: ({token, chat_id}) => {
            dispatch(loadChat({token, chat_id}))
                .then(data => {
                    dispatch(createSummaryGraphic(data));
                    dispatch(createTopStickers(data));
                    dispatch(createTopWordsForChat(data));
                    dispatch(createTimeMessage(data.timeReady,'0',0,0,0, calculateTimeScale(data.timeReady[0])));
                });

        }
    })
)(App);
