import fetch from 'cross-fetch'
import * as types from './actionType';
import * as chatTypes from '../chat/actionType'

export const loadChat = ({token, chat_id}) =>
    dispatch => {
        return fetch(`https://egorchepiga.ru/tg-stats/load/?token=${token}&chat_id=${chat_id}`, {
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: "GET"
        }).then(async response => {
            let chat = await response.json(),
                times = [];
            for (let i = 0; i < chat.time.length; i++)
                times.push(new Date(chat.time[i].time));
            chat.timeReady = times;
            dispatch({type: chatTypes.SET_CHAT, payload: chat});
            return chat;
        }).catch((er) => {
            console.log("Error: ",er)
        });
    };

export const loadUserWords = ({token, chat_id, user_id, count}) =>
    dispatch => {
        fetch(`https://egorchepiga.ru/tg-stats/more/?token=${token}&chat_id=${chat_id}&user_id=${user_id}&count=${count}`, {
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: "GET"
        }).then(async response => {
            dispatch({type: chatTypes.LOAD_MORE_WORDS, payload: await response.json()});
        }).catch((er) => {
            console.log("Error: ",er)
        });
    };

export const updateBannedWords = ({token, chat_id, banned_words}) =>
    dispatch => {
        fetch(`https://egorchepiga.ru/tg-stats/banned/?token=${token}&chat_id=${chat_id}&banned=${banned_words}`, {
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: "GET"
        }).then(async response => {
            dispatch({type: chatTypes.SET_BANNED_WORDS, payload: await response.json()});
        }).catch((er) => {
            console.log("Error: ",er)
        });
    };