import React, {Component} from 'react';
import {connect} from 'react-redux';
import './App.css';
import {loadChats} from './store/all/action';
import {setToken} from './store/getStats/token/action'
import {changeActive} from "./store/containers/menu/action";
import SummaryGraphic from './containers/summary';
import TopGraphic from './containers/top';
import TimeMessageGraphic from './containers/time';
import Stickers from './containers/stickers';
import SlideMenu from './components/Menu/Menu'
import Button from './components/button';
import UserList from './containers/userlist';
import ChatProfile from './containers/chat_profile'
import {createTimeMessage} from "./store/graphics/time/action";
import {createTopWordsForChat} from "./store/graphics/top/action";
import {loadChat, loadImages, setColorTheme} from "./store/chat/action";
import {calculateTimeScale} from "./common/timeHelpers";
import {createSummaryGraphic} from "./store/graphics/summary/action";
import {createTopStickers} from "./store/graphics/stickers_top/action";
import {setChosen} from "./store/getStats/chosen/action";
import {calculateInfo} from './store/containers/chat_profile/action'
import {getRandomPreset} from './common/colors';
import BanForm from './containers/banForm';


const buttonLabels = [
    ' Red',
    ' Orange ',
    ' Yellow ',
    ' Light-green ',
    ' Green ',
    ' Aqua-green ',
    ' Aqua-blue ',
    ' Blue ',
    ' Purple ',
    ' Pink ',
    ' Random '
];

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

class App extends Component {

    constructor(props) {
        super(props);

        this.props.setTheme({ presetIndex : getCookie('theme') || getRandomPreset() });

        let reg = /(?<=ru\/)/;
        let url = new URL(window.location).href;
        let token = "2b1d1c36fe718e317c04"; //url.slice(url.match(reg).index);
        this.props.setToken(token);
        this.props.getChats({token});
    }

    changeTheme = (event) => {
        document.cookie = `theme=${event.target.id}; path=/;`;
        let a = Object.create(this.props.store.chat);
        a.theme = event.target.id;
        this.props.setTheme({presetIndex : event.target.id, data : a});

    };

    createButtonForTheme = (label, index) => (
        <Button className={"btn btn-outline-primary btn-sm row-sm-10 row-md-10 row-lg-10 row-xl-10 theme-switcher " + label}
                key={index}
                id={index}
                label={label}
                onClick={this.changeTheme}
                active={this.props.store.chat && this.props.store.chat.theme === index.toString()}
        />
    );

    createButtonsForThemeSwitch = (buttonLabels) => (
        <div className="theme-switcher-holder">{
            buttonLabels.map(this.createButtonForTheme)
        }</div>

    );

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
        let theme = this.props.store.chat.theme;
        this.props.setChat({token : this.props.store.token, chat_id : event.target.id, theme});
        this.props.changeActive();
    };

    createNavigationComponents = (items) => {
        let arr = [];
        for (let key in items)
            arr.push(this.createButton(key, items[key]))
        return arr;
    };

    shouldComponentUpdate(props){
        return props.store.stats.chats.length !== 0
    }

    render() {
        let ready = this.props.store.chat && this.props.store.chat.chat;
        return (
            <SlideMenu
                active={this.props.store.menu.active}
                nav={this.createNavigationComponents(this.props.store.stats.chats)} >
                <div className="App">
                    <main id="panel" className="slideout-panel slideout-panel-left">
                        <div className="header-buttons">                         
                            {this.selectChatButton()}
                            {ready && this.createButtonsForThemeSwitch(buttonLabels)}
                        </div>
                        <div className="wrapper container">
                            <BanForm/>
                            <div className="graphich__wrapper_column">
                                {ready && <ChatProfile/>}
                                {ready && <UserList/>}
                                <div className="graphich__wrapper_row row justify-content-center">
                                    {!this.props.store.chosen && <SummaryGraphic/>}
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
        chooseUser :  (chosen) => {
            dispatch(setChosen(chosen))
        },
        setToken: (token) => {
            dispatch(setToken(token));
        },
        getChats: ({token}) => {
            dispatch(loadChats({token}))
        },
        changeActive: () => {
            dispatch(changeActive())
        },
        setChat: ({token, chat_id, img_ready, theme}) => {
            dispatch(loadChat({token, chat_id, img_ready}))
                .then(data => {
                    data.theme = theme;
                    dispatch(loadImages(data))
                        .then(res => {
                            res.name = data.name;
                            res.theme = theme;
                            dispatch(createTopStickers(res));
                        });
                    dispatch(createSummaryGraphic(data));
                    dispatch(createTopWordsForChat(data));
                    dispatch(createTimeMessage(data.timeReady,'0',0,0,0, calculateTimeScale(data.timeReady[0]),
                        false, 1, true, false, [], theme));
                    dispatch(calculateInfo(data.time,'0'))
                });
        },
        setTheme: ({data, presetIndex}) => {
            if (data) {
                dispatch(createSummaryGraphic(data));
                dispatch(createTopWordsForChat(data));
                dispatch(createTimeMessage(data.timeReady, '0', 0, 0, 0, calculateTimeScale(data.timeReady[0]),
                    false, 1, true, false, [], presetIndex));
                dispatch(calculateInfo(data.time, '0'))
            }
            dispatch(setColorTheme(presetIndex));
        }
    })
)(App);
