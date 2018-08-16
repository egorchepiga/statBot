import {combineReducers} from 'redux';
import token from './getStats/token/reducer';
import user from './getStats/user/reducer';
import timeFrame from './getStats/timeFrame/reducer';
import stats from './all/reducer';
import chat from './chat/reducer';
import summaryGraphic from './graphics/summary/reducer'
import topWordsForChat from './graphics/top/reducer'
import timeMessage from './graphics/time/reducer'



export default combineReducers({
    token: token,
    user: user,
    timeFrame: timeFrame,
    stats: stats,
    summaryGraphic: summaryGraphic,
    topWordsForChat: topWordsForChat,
    timeMessage: timeMessage,
    chat: chat
});