import {combineReducers} from 'redux';
import token from './getStats/token/reducer';
import chosen from './getStats/chosen/reducer';
import chats from './all/reducer';
import chat from './chat/reducer';
import summaryGraphic from './graphics/summary/reducer'
import topWordsForChat from './graphics/top/reducer'
import timeMessage from './graphics/time/reducer'
import menu from "./containers/menu/reducer"
import userList from "./containers/userlist/reducer"
import stickers from "./graphics/stickers_top/reducer"
import chat_profile from "./containers/chat_profile/reducer";
import banForm from "./containers/banned_words/reducer";

export default combineReducers({
    token: token,
    chosen: chosen,
    stats: chats,
    summaryGraphic: summaryGraphic,
    topWordsForChat: topWordsForChat,
    timeMessage: timeMessage,
    chat: chat,
    menu: menu,
    stickers: stickers,
    userList : userList,
    chatProfile: chat_profile,
    banForm: banForm
});