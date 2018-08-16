import colors from '../../../etc/color';
import * as types from './actionType';

export const createSummaryGraphic = (data) =>
    dispatch => {
        let summarys = [];
        let users = [];
        for (let user in data.users) {
            users.push(data.users[user].user);
            summarys.push(data.users[user].summary)
        }
        let tmp = {
            datasets: [{
                data: summarys,
                backgroundColor: colors(),
                label: ""
            }],
            labels: users
        };
        dispatch({type: types.SET_FIRST_DATA, payload: tmp})
    };
