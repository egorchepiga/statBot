import colors from '../../../etc/color'
import * as types from './actionType'
export const createTopWordsForChat = (data) =>
    dispatch => {
        let tmp = {};
        for (let user in data.users)
            for (let word in data.users[user].top_words)
                if (tmp[word]) {
                    tmp[word] += data.users[user].top_words[word]
                }
                else {
                    tmp[word] = data.users[user].top_words[word]
                }

        let sortable = [];
        for (let vehicle in tmp) {
            sortable.push([vehicle, tmp[vehicle]]);
        }
        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });
        let labels =[],data1=[];
        for (let s in sortable) {
            data1.push(sortable[s][1]);
            labels.push(sortable[s][0]);
        }
        let _tmp = {
            data: {
                datasets: [{
                    data: data1,
                    backgroundColor: colors(),
                    label: data.name
                }],
                labels: labels
            },
            options: {
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
function f(a, b) {
    if (a > b) return -1;
    if (a < b) return 1;
}