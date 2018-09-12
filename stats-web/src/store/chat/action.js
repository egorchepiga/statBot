import fetch from 'cross-fetch'
import * as types from './actionType';
import * as chatTypes from '../chat/actionType'

export const loadImages = ({users, chat}) =>
    dispatch => {
        let arrPromise = [];
        for(let i = 0; i < users.length; i++)
            if (users[i].img) {
                arrPromise.push(
                    fetch(`https://egorchepiga.ru/tg-stats/file_id/` + users[i].img, {
                        headers: {
                            'Accept': 'application/json',
                            'content-type': 'application/x-www-form-urlencoded'
                        },
                        method: "GET"
                    }).then(async response => {
                        let json = await response.json();
                        return json.path;
                    })
                );

                for (let sticker in users[i].top_stickers)
                    arrPromise.push(
                        fetch(`https://egorchepiga.ru/tg-stats/file_id/` + sticker.slice(9), {
                            headers: {
                                'Accept': 'application/json',
                                'content-type': 'application/x-www-form-urlencoded'
                            },
                            method: "GET"
                        }).then(async response => {
                            let json = await response.json();
                            return json.path;
                        })
                    );
            }
        for (let sticker in chat.top_stickers)
            arrPromise.push(
                fetch(`https://egorchepiga.ru/tg-stats/file_id/` + sticker.slice(9), {
                    headers: {
                        'Accept': 'application/json',
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    method: "GET"
                }).then(async response => {
                    let json = await response.json();
                    return json.path;
                })
            );
        console.log( chat.img);
        arrPromise.push(
            fetch(`https://egorchepiga.ru/tg-stats/file_id/` + chat.img, {
                headers: {
                    'Accept': 'application/json',
                    'content-type': 'application/x-www-form-urlencoded'
                },
                method: "GET"
            }).then(async response => {
                let json = await response.json();
                return json.path;
            })
        );
        return Promise.all(arrPromise)
            .then(arrRes => {
                let resIndex = 0;
                for(let i = 0; i < users.length; i++) {
                    let readyStickers = {};
                    if (users[i].img)
                        users[i].img = arrRes[resIndex++];
                    for (let sticker in users[i].top_stickers)
                        readyStickers[arrRes[resIndex++]] =  users[i].top_stickers[sticker] ;
                    users[i].top_stickers = readyStickers;
                }

                let readyStickers = {};
                for (let sticker in chat.top_stickers)
                    readyStickers[arrRes[resIndex++]] = chat.top_stickers[sticker] ;

                chat.top_stickers = readyStickers;
                chat.img = arrRes[resIndex];
                dispatch({type: chatTypes.SET_USERS_IMAGE, payload: {users, images_ready : true, readyStickers }});
                return {users, chat};
            });
    };

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