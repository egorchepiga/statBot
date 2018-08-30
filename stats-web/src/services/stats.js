import fetch from 'cross-fetch'
import * as types from '../store/all/actionType'

export const getAll = ({id, token, fromTime, toTime}) =>
    dispatch => {
        fetch(`https://egorchepiga.ru/chat/local/analyze/?token=${token}`, {
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: "GET"
        }).then(async response => {
            let arr = await response.json();
            for (let j = 0; j < arr.length-1; j++) {
                let times = [];
                for (let i = 0; i < arr[j].time.length-1; i++)
                    times.push(new Date(arr[j].time[i].time));
                arr[j].timeReady = times;
            }
            dispatch({type: types.SET_STATS, payload: arr}) //пока не разбираю, пушу как есть
        }).catch((er) => {
            console.log("Error: ",er)
        })
    };