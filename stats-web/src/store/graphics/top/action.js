import colors from '../../../common/colors'
import * as types from './actionType'
import fetch from "cross-fetch";

export const loadUserWords = ({token, chat_id, user_id, count}) =>
    dispatch => {
        return fetch(`https://egorchepiga.ru/tg-stats/more/?token=${token}&chat_id=${chat_id}&user_id=${user_id}&count=${count}`, {
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: "GET"
        }).then(async response => {
            let res = await response.json();
            dispatch({type: types.LOAD_MORE_WORDS, payload: res});
            return res;
        }).catch((er) => {
            console.log("Error: ",er)
        });
    };

export const createTopWordsForChat = (data, forChat = true, chosen = false) =>
    dispatch => {
        let tmp = [], labels =[], data1=[], names=[],
            users = data.users.slice();

        if(chosen) {
            let chosenUser = [];
            for (let i = 0; i < users.length; i++)
                if (users[i].user === chosen)
                    chosenUser.push(users[i]);
            users = chosenUser;
        }

        if (forChat)
            for (let word in data.chat.top_words)
                tmp.push({word: word, count: data.chat.top_words[word]})
        else
            for (let user in users)
                for (let word in users[user].top_words)
                    tmp.push({user: users[user].user, word: word, count: users[user].top_words[word]})

        while (tmp.length > 0 && data1.length < 20) {
            let tm = tmp[0],
                index = 0;
            for (let i = 1; i < tmp.length; i++) {
                if (tm.count < tmp[i].count) {
                    tm = tmp[i];
                    index = i;
                }
            }
            data1.push(tmp[index].count);
            labels.push(tmp[index].word);
            if (tmp[index].user)
                names.push(tmp[index].user);
            tmp.splice(index, 1);
        }

        let payload = {
            forChat : forChat,
            data: {
                datasets: [{
                    data: data1,
                    backgroundColor: colors(data.theme),
                    label: data.name,
                    labels : names
                }],
                labels: labels
            },
            options: {
                tooltips:  {
                    callbacks: {
                        label:  function(item, data) {
                            let dataset = data.datasets[item.datasetIndex];
                            return names.length > 1
                                ? dataset.labels[item.index]
                                + ": " + dataset.data[item.index]
                                : dataset.label + ": " + dataset.data[item.index];
                        }
                    }
                } ,
                scales: {
                    xAxes: [{
                        beginAtZero: true,
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },
        };
        dispatch({type: types.SET_SECOND_ALL, payload: payload})
    };
