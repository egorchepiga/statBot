import colors from '../../../etc/color';
import * as types from './actionType';


Date.prototype.monthAlignment = function() {                                                                            //1-е число месяца
    this.setDate(1);
};

Date.prototype.weekAlignment = function() {                                                                             //Ближайший понедельник
    let weekDays = [6, 0, 1, 2, 3, 4, 5],
        dayOfWeek = weekDays[this.getDay()];
    this.setDate(this.getDate() - dayOfWeek);
};

export const createSummaryGraphic = (data, dayScale = '0', topSwitch = true) =>
    dispatch => {
        let users = {},
            today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);

        for(let user in data.users) {
            users[data.users[user].user] = 0;
        }

        let targetDate = today;
        switch(dayScale){
            case '1':
                break;
            case '2':
                targetDate.weekAlignment();
                break;
            case '3':
                targetDate.monthAlignment();
                break;
            default:
                targetDate = data.timeReady[0];
        }

        for(let i=data.time.length-1; i > -1; i--)
            if(new Date(data.time[i].time) > targetDate)
                users[data.time[i].user] = users[data.time[i].user] + 1;
            else break;

        let summary = [],
            userNames = [];
        for (let user in users) {
            userNames.push(user);
            summary.push(users[user]);
        }

        if (topSwitch) {
            let topSummary = [],
                topUserNames = [];
            while (topSummary.length < 3 && userNames.length > 1) {
                let tmp = summary[0],
                    index = 0;
                for (let i = 1; i < summary.length; i++) {
                    if (tmp < summary[i]) {
                        tmp = summary[i];
                        index = i;
                    }
                }
                topSummary.push(tmp);
                topUserNames.push(userNames[index]);
                summary.splice(index, 1);
                userNames.splice(index, 1);
            }
            let sum = 0;
            if(userNames.length > 1) {
                for (let i = 0; i < summary.length; i++)
                    sum += summary[i];
                topSummary.push(sum);
                topUserNames.push('other');
            }
            userNames = topUserNames;
            summary = topSummary;

        }

        let tmp = {
            topSwitch : topSwitch,
            dayScale: dayScale,
            datasets: [{
                data: summary,
                backgroundColor: colors(),
                label: ""
            }],
            labels: userNames
        };
        dispatch({type: types.SET_FIRST_DATA, payload: tmp})
    };
