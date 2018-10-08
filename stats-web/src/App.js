import React, {Component} from 'react';
import {connect} from 'react-redux';
import './styles/sass/App.sass';
import {loadChats} from './store/all/action';
import {setToken} from './store/getStats/token/action'
import {changeLocale} from './store/getStats/locale/action';
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
import RadioButton from './components/radiobutton';
import UnauthorizedScreen from './containers/unauthorized';
import EmptyList from './containers/empty';
import {createTimeMessage} from "./store/graphics/time/action";
import {createTopWordsForChat} from "./store/graphics/top/action";
import {loadChat, loadImages, setColorTheme, deleteChat} from "./store/chat/action";
import {calculateTimeScale} from "./common/timeHelpers";
import {createSummaryGraphic} from "./store/graphics/summary/action";
import {createTopStickers} from "./store/graphics/stickers_top/action";
import {setChosen} from "./store/getStats/chosen/action";
import {calculateInfo} from './store/containers/chat_profile/action'
import fetch from "cross-fetch";


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

        let url = new URL(window.location);
        let token = url.searchParams.get("token");
        let admin_token = url.searchParams.get("adm");
        let chat = url.searchParams.get("chat");
        let locale = url.searchParams.get("l");
        this.props.setToken({token, admin_token});
        this.props.setLocale(locale);

        if(token === 'demo') {
            this.props.getChats({token, admin_token});
            this.props.setChat({token, chat_id: "-1001106906533", theme: theme});
            this.props.changeActive();
        } else if (chat) {
            this.props.changeActive();
            this.props.setChat({token, chat_id: chat, theme: theme})
        } else if (admin_token) {
            this.props.getChats({token, admin_token});
        } else {
            this.props.changeActive();
            this.props.setToken({token: "unauthorized"})
        }
    }

    changeTheme = (event) => {
        document.cookie = `theme=${event.target.id}; path=/;`;
        let a = Object.create(this.props.store.chat);
        a.theme = event.target.id;
        this.props.setTheme({presetName : event.target.id, data : a});

    };

    createButtonForTheme = (item, index) => {
        for(let key in item)
        //col-5 col-sm-4 col-md-3 col-lg-2 col-xl-2
        return (<div className="scale-radio">
            <RadioButton
                className={key + 'TimeRadio TimeRadio '}
                key={index + key}
                data_id={key}
                label={item[key]}
                onChange={this.changeTheme}
                checked={this.props.store.chat.theme === key}
            />
        </div>)
    };

    createButtonsForThemeSwitch = (buttonLabels) => (
        <div className="theme-switcher-holder row">{
            buttonLabels.map(this.createButtonForTheme)
        }</div>

    );

    selectChatButton = () => (
        <div className="slideout-menu-wrapper">
        <button onClick={this.props.changeActive}
                className={"btn-fr "+ (getCookie('theme') || 'Random')}>
            <div className="d-block d-sm-none">☰</div>
            <div className="d-none d-sm-block select-chat-btn">{this.props.store.locale.settings.select}</div>
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
        this.props.setChat({token : this.props.store.token.token, chat_id : event.target.id, theme});
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

    refreshInfo = () => {
        this.props.refreshInfo({
            token: this.props.store.token.token,
            admToken: this.props.store.token.admin_token,
            chat_id:this.props.store.chat.id,
            theme: this.props.store.chat.theme
        });
    };

    deleteChat = () => {
        this.props.destroyChat({
            token: this.props.store.token.token,
            admin_token: this.props.store.token.admin_token,
            chat_id:this.props.store.chat.id,
        });
    };

    createButtonRefresh = () => (
        <Button className="btn-fr"
                key="Refresh"
                id="Refresh"
                label={this.props.store.locale.settings.refresh}
                onClick={this.refreshInfo}
                theme={this.props.store.chat.theme}
        />
    );

    createButtonDelete = () => (
        <Button className="btn-fr"
                key="Delete"
                id="Delete"
                label={this.props.store.locale.settings.delete}
                onClick={this.deleteChat}
                theme={this.props.store.chat.theme}
        />
    );

    render() {
        let isEmpty = function(obj) {
            for(let key in obj)
                return false;
            return true;
        };
        let admMode = !isEmpty(this.props.store.stats.chats);
        let ready = this.props.store.chat && this.props.store.chat.chat;
        let settings = this.props.store.menu.settings;
        let unauthorized = this.props.store.token.token === 'unauthorized';
        let deleted = this.props.store.token.token === 'deleted';
        return (
            <SlideMenu
                active={this.props.store.menu.active}
                nav={this.createNavigationComponents(this.props.store.stats.chats)} >
                <div className="App">
                    <main id="panel" className="slideout-panel slideout-panel-left">
                        {(unauthorized || deleted) && <UnauthorizedScreen/>}
                        {this.props.store.token.token === 'empty' && <EmptyList/>}
                        <div className="header-buttons">
                            {admMode && !unauthorized && !deleted && this.selectChatButton()}
                            {ready && this.createButtonSettings()}
                            {ready &&
                            <div className={"settings " + settings}>
                                {admMode && <BanForm/>}
                                {admMode && this.createButtonRefresh()}
                                {admMode && this.createButtonDelete()}
                                {this.createButtonsForThemeSwitch(this.props.store.locale.settings.theme)}
                            </div>}
                        </div>
                        <div className="wrapper container">
                            <div className="header__most-active">
                                {ready && <ChatProfile/>}
                                {ready && <UserList/>}
                            </div>
                            <div className="graphich__wrapper_column">
                                <div className="graphich__wrapper_row row justify-content-center">
                                    {!this.props.store.chosen && ready && <SummaryGraphic/>}
                                    {ready && <TopGraphic/>}
                                    {ready && <Stickers/>}
                                    {ready && <TimeMessageGraphic/>}
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
        setToken: (tokens) => {
            dispatch(setToken(tokens));
        },
        getChats: ({token, admin_token}) => {
            dispatch(loadChats({token, admin_token}))
                .then(res =>{
                    if(res['unauthorized']) dispatch(setToken({token: 'unauthorized'}));
                    if(res['empty']) dispatch(setToken({token: 'empty'}));
                });
        },
        changeActive: () => {
            dispatch(changeActive())
        },
        setChat: ({token, chat_id, theme}) => {
            setChat(dispatch, {token, chat_id, theme})
        },
        destroyChat: ({token, admin_token, chat_id}) => {
            dispatch(deleteChat({token, admin_token, chat_id}))
                .then(res => {
                    dispatch(setToken({token: res.result}));
                    setChat(dispatch, {})
                })
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
        },
        refreshInfo: ({token, admToken, chat_id, theme}) => {
            fetch(`https://egorchepiga.ru/tg-stats/refresh/?token=${token}&adm=${admToken}&chat_id=${chat_id}`, {
                headers: {
                    'Accept': 'application/json',
                    'content-type': 'application/x-www-form-urlencoded'
                },
                method: "GET"
            }).then(res => setChat(dispatch, {token, chat_id, theme}))
        },
        setLocale: (locale) => {
            dispatch(changeLocale(locale));
        }
    })
)(App);


function setChat(dispatch,{token, chat_id, theme}) {
    dispatch(loadChat({token, chat_id}))
        .then(data => {
            if(!data['unauthorized']) {
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
                dispatch(createTimeMessage(data.timeReady, '0', 0, 0, 0, calculateTimeScale(data.timeReady[0]),
                    false, 1, true, false, [], theme));
                dispatch(calculateInfo(data.time, '0'))
            } else
                dispatch(setToken({token: "unauthorized"}))
        });
}