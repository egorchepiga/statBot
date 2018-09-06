import colors from '../../../etc/color'
import * as types from './actionType'
export const createTopWordsForChat = (data, forChat = false) =>
    dispatch => {
        let tmp = [];
        let labels =[],data1=[], names=[];

        console.log(data.chat.top_words);

        if (!forChat){
            for (let word in data.chat.top_words) {
                tmp.push({word: word, count: data.chat.top_words[word]})
            }
        } else {

            for (let user in data.users) {
                for (let word in data.users[user].top_words) {
                    tmp.push({user: data.users[user].user, word: word, count: data.users[user].top_words[word]})
                }
            }
        }
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
                labels.push(tmp[index].word);
                if (tmp[index].user)
                    names.push(tmp[index].user);
                tmp.splice(index, 1);
            }



        let _tmp = {
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
                            return names.length > 1
                                ? data.datasets[item.datasetIndex].labels[item.index]
                                + ": " + data.datasets[item.datasetIndex].data[item.index]
                                : data.datasets[item.datasetIndex].label;
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
        dispatch({type: types.SET_SECOND_ALL, payload: _tmp})
    };
