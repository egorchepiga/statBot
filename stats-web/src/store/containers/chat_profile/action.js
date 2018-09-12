import * as types from './actionType'

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
};

export const calculateInfo = (timeArray, scale) =>
    dispatch => {
        let pickHours = {}, info = {},
            date = new Date();
        info.count = 0;
        let users = {};
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        switch(scale){
            case '1':
                date.addDays(-7);
                break;
            case '2':
                date.addDays(-31);
                break;
            default:
        }

        for(let i =0; i< 24; i++)
            pickHours[i] = 0

        for (let i = timeArray.length-1; i > -1; i--){
            let tmp = new Date(timeArray[i].time);
            if (tmp < date)
                break;
            info.count++;
            users[timeArray[i].user] = 0;
            pickHours[tmp.getHours()]++;
        }
        let maxHour = 0;
        info.pickHour = "no activity";
        for(let hour in pickHours)
                if (pickHours[hour] > maxHour) {
                    maxHour = pickHours[hour];
                    info.pickHour = (hour >= 10 ? hour : '0' + hour) + ":00";
                }
        info.users = Object.keys(users).length;

        dispatch({type : types.SET_INFO, payload: info})
    };