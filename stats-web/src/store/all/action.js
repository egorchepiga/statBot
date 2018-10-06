import fetch from 'cross-fetch'
import * as types from './actionType'

export const loadChats = ({token, admin_token}) => {
    return dispatch => {
        return fetch(`https://egorchepiga.ru/tg-stats/chats/?token=${token}&adm=${admin_token}`, {
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: "GET"
        }).then(async response => {
            let res = await response;
            if(res.status === 401) return {"unauthorized" : "unauthorized" };
            dispatch({type: types.SET_CHATS, payload: res});
            return res;
        }).catch((er) => {
            console.log("Error: ",er)
        });
    }
};