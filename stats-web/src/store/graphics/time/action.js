import * as types from './actionType'
import colors from '../../../etc/color'
let moment = require('moment');
moment.locale('ru');


Date.prototype.addDays = function(days) {
    this.setDate(new Date(this.valueOf()).getDate() + days);
};

Date.prototype.monthAlignment = function() {
    this.setDate(1);
};

Date.prototype.weekAlignment = function() {
    this.setDate(new Date(this.valueOf()).getDate() - this.getDay() + 1);
};

export const createTimeMessage = (timeArray, scale = 0, brutal = false) =>
    dispatch => {
        let times = prepareTime(timeArray, scale);
        let time = [];
        for (let t in times) {
            time.push({t: t, y: times[t]});
        }

        let cfg = {
            timeReady: timeArray,
            scale : scale,
            brutal : brutal,
            data: {
                labels: Object.keys(times),
                datasets: [{
                    label: 'Количество сообщений по дням',
                    data: time,
                    pointRadius: 4,
                    fill: false,
                    borderWidth: 2,
                    lineTension: 0,
                    fill: false,
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)'
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        distribution: 'series',
                         ticks: {
                             source: 'labels'
                         }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'сообщения'
                        }
                    }]
                }
            }
        };
        dispatch({type: types.SET_THIRD_ALL, payload: cfg});
    };

function prepareTime(arr, scale) {
    let times = [],
        daysToShow = new Date(
            Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate(),
                0,0,0)
        );
    switch (scale) {
        case '1':
            times = scaleTimeGraphic(arr, hours, daysToShow);
            break;
        case '2':
            daysToShow.addDays(-3);
            times = scaleTimeGraphic(arr, daySixHours , daysToShow);
            break;
        case '3':
            daysToShow.weekAlignment();
            times = scaleTimeGraphic(arr, monthDays , daysToShow);
            break;
        case '4':
            daysToShow.monthAlignment();
            times = scaleTimeGraphic(arr, yearMonthDay , daysToShow);
            break;
        case '5':
            break;
        default:
            let foo,
                diffDays = Math.ceil(daysToShow - arr[0] / (1000 * 3600 * 24));
            if (diffDays <= 1) foo = hours;
            else if (diffDays <= 3) foo = daySixHours;
            else if (diffDays <= 7) foo = monthDays;
            else if (diffDays > 7) foo = yearMonthDay;
            times = scaleTimeGraphic(arr, foo, arr[0]);
    }
    return times;
}

function scaleTimeGraphic(arr, func, daysToShow) {
    let tmpDate = daysToShow,
        placeholder = {},
        date = new Date(
            Date.UTC(
                new Date().getUTCFullYear(),
                new Date().getUTCMonth(),
                new Date().getUTCDate() + 1,            //ближайший следующий день
                0,0,0)
        );
    while (tmpDate < date) {
        tmpDate = new Date(tmpDate.setUTCHours(tmpDate.getUTCHours() + 1));
        placeholder[func.call(new Date(tmpDate))] = 0;
    }
    let times = [];
    for (let i = arr.length-1; i > -1; i--)
        if (arr[i] < daysToShow) break;
        else times.push(arr[i]);
    return times.reduce(function (acc, el) {
        acc[func.call(el)] = (acc[func.call(el)] || 0) + 1;
        return acc;
    }, placeholder);
}

let hours = function () {
    let hour = (this.getUTCHours() < 10 ?  "0" : "") + this.getUTCHours().toString();
    return hour + ":00";
};

let daySixHours = function () {
    let hour = this.getUTCHours(),
        month = (this.getUTCMonth() < 10 ?  "0" : "") + this.getUTCMonth().toString(),
        day = (this.getUTCDate() < 10 ?  "0" : "") + this.getUTCDate().toString();
    let strHour = '';
    if (hour <= 6) strHour = "03";
    else if (hour <= 12) strHour = "09";
    else if (hour <= 18) strHour = "15";
    else if (hour <= 24) strHour = "21";
    return day + "." + month + " " + strHour + ":00";
};

let monthDays = function () {
    let month = (this.getUTCMonth() < 10 ?  "0" : "") + this.getUTCMonth().toString(),
        day = (this.getUTCDate() < 10 ?  "0" : "") + this.getUTCDate().toString();
    return day + "." + month;
};

let yearMonthDay = function () {
    let year = this.getUTCFullYear().toString(),
        month = (this.getUTCMonth() < 10 ?  "0" : "") + this.getUTCMonth().toString(),
        day = (this.getUTCDate() < 10 ?  "0" : "") + this.getUTCDate().toString();
    return day + "." + month + "." + year;
};