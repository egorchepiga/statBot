import fetch from 'cross-fetch'
import * as initialType from '../store/all/actionType'


export const loadChats = ({token}) => {
    return dispatch => {
        fetch(`http://egorchepiga.ru/chat/local/chats/?token=${token}`, {
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: "GET"
        }).then(async response => {
            dispatch({type: initialType.SET_CHATS, payload: await response.json()})
        }).catch((er) => {
            console.log("Error: ",er)
        });
    }
};