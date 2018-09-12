import colors from '../../../common/colors'
import * as types from './actionType'
export const createTopStickers = (data, forChat = true, chosen = false) =>
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
            for (let sticker in data.chat.top_stickers)
                tmp.push({sticker: sticker, count: data.chat.top_stickers[sticker]})
        else
            for (let user in users)
                for (let sticker in users[user].top_stickers) {
                    tmp.push({user: users[user].user, sticker: sticker, count: users[user].top_stickers[sticker]})
                }

        let stickers = tmp.slice();
        while (tmp.length > 0) {
            let tm = tmp[0],
                index = 0;
            for (let i = 1; i < tmp.length; i++) {
                if (tm.count < tmp[i].count) {
                    tm = tmp[i];
                    index = i;
                }
            }
            data1.push(tmp[index].count);
            labels.push('');
            if (tmp[index].user)
                names.push(tmp[index].user);
            tmp.splice(index, 1);
        }

        labels.splice(5);

        while (labels.length<5)
            labels.push('');

        let payload = {
            stickers : stickers,
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

                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            },
        };
        dispatch({type: types.SET_TOP_STICKERS, payload: payload})
    };
