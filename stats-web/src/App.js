import React, {Component} from 'react';
import {connect} from 'react-redux';
import './App.css';
import {loadChats} from './store/all/action';
import {setToken} from './store/getStats/token/action'
import {changeActive, changeSettings} from "./store/containers/menu/action";
import SummaryGraphic from './containers/summary';
import TopGraphic from './containers/top';
import TimeMessageGraphic from './containers/time';
import Stickers from './containers/stickers';
import SlideMenu from './components/Menu/Menu'
import Button from './components/button';
import UserList from './containers/userlist';
import ChatProfile from './containers/chat_profile'
import BanForm from './containers/banned_words'
import {createTimeMessage} from "./store/graphics/time/action";
import {createTopWordsForChat} from "./store/graphics/top/action";
import {loadChat, loadImages, setColorTheme} from "./store/chat/action";
import {calculateTimeScale} from "./common/timeHelpers";
import {createSummaryGraphic} from "./store/graphics/summary/action";
import {createTopStickers} from "./store/graphics/stickers_top/action";
import {setChosen} from "./store/getStats/chosen/action";
import {calculateInfo} from './store/containers/chat_profile/action'


const buttonLabels = [
    'Orange',
    'Yellow-Gray',
    'Green',
    'Aqua',
    'Purple-Gray',
    'Pink',
    'Random'
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

        let theme = getCookie('theme') || 'Random';
        this.props.setTheme({presetName: theme});

        //let reg = /(?<=ru\/)/;
        let url = new URL(window.location);
        /*let index = url.match(reg).index;
        let token = url.slice(index);*/
        let token ='a34820913835557dc7af';// url.searchParams.get("token");
        let admin_token = 'dc83136d3f5064f35cf3';//url.searchParams.get("adm");
        let chat = url.searchParams.get("chat");
        this.props.setToken(token);

        if (admin_token) {
            this.props.getChats({token, admin_token})
        }
        else if (chat) {
            this.props.changeActive();
            this.props.setChat({token, chat_id: chat, theme: theme})
        }
    }

    changeTheme = (event) => {
        document.cookie = `theme=${event.target.id}; path=/;`;
        let a = Object.create(this.props.store.chat);
        a.theme = event.target.id;
        this.props.setTheme({presetName : event.target.id, data : a});

    };

    createButtonForTheme = (label, index) => (
        <Button className={"btn-fr theme-button col-3 col-sm-3 col-md-2 col-lg-1 col-xl-1 bouncy " + label}
                key={index}
                id={label}
                label={label}
                onClick={this.changeTheme}
                active={this.props.store.chat.theme === label}
                style={{"animation-delay":"0."+(7*(index+2)).toString()+"s"}}
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
                className={"btn-fr "+ (getCookie('theme') || 'Random')}>
            <div className="d-block d-sm-none">☰</div>
            <div className="d-none d-sm-block select-chat-btn">Select chat</div>
        </button>
        </div>
    );

    createButton = (id, label) => (
        <Button className={"col-11 col-sm-11 col-md-11 col-lg-11 col-xl-11 chat-btn btn-fr "+ (getCookie('theme') || 'Random')}
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

    createButtonSettings = () => (
        <Button className="theme-settings btn-fr col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1"
                key="Theme"
                id="Theme"
                label="&#128736;"
                onClick={this.props.setSettings}
                active={this.props.store.menu.settings}
                theme={this.props.store.chat.theme}
        />
    );



    render() {
        let isEmpty = function(obj) {
            for (let key in obj)
                return false;
            return true;
        };
        let admMode = !isEmpty(this.props.store.stats.chats);
        let ready = this.props.store.chat && this.props.store.chat.chat;
        let settings = this.props.store.menu.settings;
        return (
            <SlideMenu
                active={this.props.store.menu.active}
                nav={this.createNavigationComponents(this.props.store.stats.chats)} >
                <div className="App">
                    <main id="panel" className="slideout-panel slideout-panel-left">
                        <div className="header-buttons">
                            {admMode && this.selectChatButton()}
                            {ready && this.createButtonSettings()}
                            {settings && this.createButtonsForThemeSwitch(buttonLabels)}
                        </div>
                        <div className="wrapper container">
                            <div className="header__most-active">
                                <BanForm/>
                                {ready && <ChatProfile/>}
                                {ready && <UserList/>}
                            </div>
                            <div className="graphich__wrapper_column">
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
        getChats: ({token, admin_token}) => {
            dispatch(loadChats({token, admin_token}))
        },
        changeActive: () => {
            console.log('WHOS')
            dispatch(changeActive())
        },
        setChat: ({token, chat_id, theme}) => {
            dispatch(loadChat({token, chat_id}))
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
                    dispatch(createTopStickers(data));
                    dispatch(createTimeMessage(data.timeReady,'0',0,0,0, calculateTimeScale(data.timeReady[0]),
                        false, 1, true, false, [], theme));
                    dispatch(calculateInfo(data.time,'0'))
                });
        },
        setTheme: ({data, presetName}) => {
            if (data) {
                dispatch(createSummaryGraphic(data));
                dispatch(createTopWordsForChat(data));
                dispatch(createTimeMessage(data.timeReady, '0', 0, 0, 0, calculateTimeScale(data.timeReady[0]),
                    false, 1, true, false, [], presetName));
                dispatch(calculateInfo(data.time, '0'));
                dispatch(createTopStickers(data));
            }
            dispatch(setColorTheme(presetName));
        },
        setSettings: () => {
            dispatch(changeSettings())
    }
    })
)(App);
