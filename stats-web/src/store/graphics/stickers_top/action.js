import colors from '../../../etc/color'
import * as types from './actionType'
export const createTopStickers = (data, forChat = false) =>
    dispatch => {
        let tmp = [], labels =[], data1=[], names=[];

        if (!forChat)
            for (let sticker in data.chat.top_stickers)
                tmp.push({sticker: sticker, count: data.chat.top_stickers[sticker]})
        else
            for (let user in data.users)
                for (let sticker in data.users[user].top_stickers) {
                    tmp.push({user: data.users[user].user, sticker: sticker, count: data.users[user].top_stickers[sticker]})
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

        let payload = {
            stickers : stickers,
            forChat : forChat,
            data: {
                datasets: [{
                    data: data1,
                    backgroundColor: colors(),
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
                        gridLines: {
                        },
                        beginAtZero: true,
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
