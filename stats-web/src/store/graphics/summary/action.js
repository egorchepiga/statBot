import colors from '../../../common/colors';
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

        if(new URL(window.location).searchParams.get("token") === 'demo') today = new Date(2018, 8, 29, 0,0,0,0);

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

        for(let user in data.users)
            users[data.users[user].user] = 0;

        for(let i=data.time.length-1; i >= 0; i--)
            if(new Date(data.time[i].time) > targetDate)
                users[data.time[i].user] = users[data.time[i].user] + 1 || 0;
            else break;

        if (topSwitch)
            users = Object.keys(users)
                .sort((a,b) => users[b] - users[a])
                .reduce((val, next, index) => {
                    if(index < 5) val[next] = users[next];
                    return val;
                },{});


        let summary = [],
            userNames = [];
        for (let user in users) {
            if(users[user] > 0) {
                userNames.push(user);
                summary.push(users[user]);
            }
        }
        
        let graphColors = colors(data.theme);
        let tmp = {
            theme: graphColors.theme,
            topSwitch : topSwitch,
            dayScale: dayScale,
            datasets: [{
                data: summary,
                backgroundColor: graphColors.colors,
                label: ""
            }],
            labels: userNames
        };
        dispatch({type: types.SET_FIRST_DATA, payload: tmp})
    };
