import {combineReducers} from 'redux';
import token from './getStats/token/reducer';
import user from './getStats/user/reducer';
import timeFrame from './getStats/timeFrame/reducer';
import chats from './all/reducer';
import chat from './chat/reducer';
import summaryGraphic from './graphics/summary/reducer'
import topWordsForChat from './graphics/top/reducer'
import timeMessage from './graphics/time/reducer'
import menu from "./menu/reducer"
import stickers from "./graphics/stickers_top/reducer"

export default combineReducers({
    token: token,
    user: user,
    timeFrame: timeFrame,
    stats: chats,
    summaryGraphic: summaryGraphic,
    topWordsForChat: topWordsForChat,
    timeMessage: timeMessage,
    chat: chat,
    menu: menu,
    stickers: stickers
});