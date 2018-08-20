import * as types from './actionType'
import colors from '../../../etc/color'
let moment = require('moment');
moment.locale('ru');


Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
};

Date.prototype.monthAlignment = function() {                                //1-е число месяца
    this.setDate(1);
};

Date.prototype.weekAlignment = function() {
    let weekday = [6, 0, 1, 2, 3, 4, 5],
        dayOfWeek = weekday[this.getDay()];
    this.setDate(this.getDate() - dayOfWeek);                       //Ближайший понедельник
};

export const createTimeMessage = (timeArray, scale = 0, brutal = false) =>
    dispatch => {
        let preparedTimeArray = prepareTime(timeArray, scale),
            timeGraphicData = [];
        console.log(preparedTimeArray);
        for (let time in preparedTimeArray) {
            timeGraphicData.push({t: time, y: preparedTimeArray[time]});    //наносим метки на Ox и Oy
        }

        let cfg = {
            RAWTime: timeArray,
            scale : scale,
            brutal : brutal,
            data: {
                labels: Object.keys(preparedTimeArray),
                datasets: [{
                    label: 'Количество сообщений по дням',
                    data: timeGraphicData,
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
        daysToShow = new Date();
        daysToShow.setHours(0);
        daysToShow.setMinutes(0);
        daysToShow.setSeconds(0);                                             //Сегодня 00:00:00
    switch (scale) {
        case '1':                                                             //день
            times = scaleTimeGraphic(arr, hours, daysToShow);
            break;
        case '2':                                                             //3 дня
            daysToShow.addDays(-3);
            times = scaleTimeGraphic(arr, daySixHours , daysToShow);
            break;
        case '3':                                                             //неделя
            daysToShow.weekAlignment();
            times = scaleTimeGraphic(arr, monthDays , daysToShow);
            break;
        case '4':                                                             //месяц
            daysToShow.monthAlignment();
            times = scaleTimeGraphic(arr, yearMonthDay , daysToShow);
            break;
        case '5':                                                             //пользовательская дата
            break;
        default:                                                              //всё время
            let foo,
                diffDays = Math.ceil(daysToShow - arr[0] / (1000 * 3600 * 24));
            if (diffDays <= 1) foo = hours;                                   //выбор функции-шаблона в зависимости
            else if (diffDays <= 3) foo = daySixHours;                        //от размера массива времени по дням
            else if (diffDays <= 7) foo = monthDays;
            else if (diffDays > 7) foo = yearMonthDay;
            times = scaleTimeGraphic(arr, foo, arr[0]);
    }
    return times;
}

//Функция масштабирования массива времени.
// arr - массив времени
// func - функция шаблон
// daysToShow - последняя дата для чтения с конца.

function scaleTimeGraphic(arr, func, daysToShow) {
    let tmpDate = daysToShow,
        placeholder = {};
        let date = new Date();
    date.setHours(23);                                 //сегодня 23:00:00 (последнее учитываемое время за день)
    date.setMinutes(0);
    date.setSeconds(0);
    let hours = tmpDate.getHours();
    while (tmpDate < date) {                           //Первая запись массива времени < сегодня 23:00:00
        tmpDate = new Date(tmpDate.setHours(hours));
        hours = tmpDate.getHours() + 1;                //Увеличиваем счётчик первой записи на 1 час вперёд
        placeholder[func.call(new Date(tmpDate))] = 0; //функция-шаблон {time:'XXXX-XX/XX/XX', ...} -> {'XX.XX XX:XX' : 0, ...)
    }                                                  //формируем шаблон для Ox - объект с ключами соотвествующими функции шаблону (равномерные метки по Ox).
    let times = [];
    for (let i = arr.length-1; i > -1; i--)            //Фильтруем массив времени по дате с конца
        if (arr[i] < daysToShow) break;
        else times.push(arr[i]);
    return times.reduce(function (acc, el) {
        acc[func.call(el)]++;                          //формируем значения с ключами соотвествующими функции шаблону
        return acc;                                    //при совпадении ключа увеличиваем его значение на 1
    }, placeholder);                                   //все ключи уже существуют в шаблоне - placeholder
}

//------------------------------Функции-шаблоны---------------------------------

let hours = function () {
    let hour = (this.getHours() < 10 ?  "0" : "") + this.getHours().toString();    // XXXX-XX/XX/XX XX:XX -> XX:00
    return hour + ":00";
};

let daySixHours = function () {                                                    // XXXX-XX/XX/XX XX:XX -> XX.XX 03:00, 09:00...
    let hour = this.getHours(),
        month = (this.getMonth() < 10 ?  "0" : "") + this.getMonth().toString(),
        day = (this.getDate() < 10 ?  "0" : "") + this.getDate().toString();
    let strHour = '';
    if (hour <= 6) strHour = "03";
    else if (hour <= 12) strHour = "09";
    else if (hour <= 18) strHour = "15";
    else if (hour <= 24) strHour = "21";
    return day + "." + month + " " + strHour + ":00";
};

let monthDays = function () {                                                      // XXXX-XX/XX/XX XX:XX -> XX.XX
    let month = (this.getMonth() < 10 ?  "0" : "") + this.getMonth().toString(),
        day = (this.getDate() < 10 ?  "0" : "") + this.getDate().toString();
    console.log(day + "." + month);
    return day + "." + month;
};

let yearMonthDay = function () {                                                   // XXXX-XX/XX/XX XX:XX -> XX.XX.XXXX
    let year = this.getFullYear().toString(),
        month = (this.getMonth() < 10 ?  "0" : "") + this.getMonth().toString(),
        day = (this.getDate() < 10 ?  "0" : "") + this.getDate().toString();
    return day + "." + month + "." + year;
};