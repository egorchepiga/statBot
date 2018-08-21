import * as types from './actionType'
import colors from '../../../etc/color'
//let moment = require('moment');
//moment.locale('ru');


Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
};

Date.prototype.monthAlignment = function() {                                //1-е число месяца
    this.setDate(1);
};

Date.prototype.weekAlignment = function() {
    let weekDays = [6, 0, 1, 2, 3, 4, 5],
        dayOfWeek = weekDays[this.getDay()];
    this.setDate(this.getDate() - dayOfWeek);                               //Ближайший понедельник
};

export const createTimeMessage = (timeArray, scale = 0, brutal = false, fromTime = 0, toTime = 0, customScale = 0) =>
    dispatch => {
        let preparedTimeArray = prepareTime(timeArray, scale, brutal, fromTime, toTime, customScale),
            tmpPreparedTimeArray = {},
            timeGraphicData = [];

        for (let key in preparedTimeArray)
            if(!isNaN(preparedTimeArray[key]))
                tmpPreparedTimeArray[key] = preparedTimeArray[key];
        for (let time in tmpPreparedTimeArray)
            timeGraphicData.push({t: time, y: tmpPreparedTimeArray[time]});    //наносим метки на Ox и Oy
        
        let cfg = {
            RAWTime: timeArray,
            scale : scale,
            brutal : brutal,
            customScale: customScale,
            fromTime: fromTime,
            toTime: toTime,
            data: {
                labels: Object.keys(tmpPreparedTimeArray),
                datasets: [{
                    label: 'Количество сообщений по дням',
                    data: timeGraphicData,
                    pointRadius: 4,
                    fill: false,
                    borderWidth: 2,
                    lineTension: 0,
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

function prepareTime(arr, scale, brutal, fromTime, toTime, customScale) {
    let scaleFoo,
        times = [],
        timeFromShow = new Date();
        timeFromShow.setHours(0);
        timeFromShow.setMinutes(0);
        timeFromShow.setSeconds(0);                                           //Сегодня 00:00:00
    switch (scale) {
        case '1':                                                             //день
            if (brutal) {
                timeFromShow.addDays(-1);
                timeFromShow.setHours(new Date().getHours());
            }
            times = scaleTimeGraphic(arr, hours, timeFromShow);
            break;
        case '2':                                                             //3 дня
            if (brutal) {
                timeFromShow.addDays(-3);
                timeFromShow.setHours(new Date().getHours());
            } else
                timeFromShow.addDays(-2);
            times = scaleTimeGraphic(arr, daySixHours , timeFromShow);
            break;
        case '3':                                                             //неделя
            brutal ? timeFromShow.addDays(-7) : timeFromShow.weekAlignment();
            times = scaleTimeGraphic(arr, monthDays , timeFromShow);
            break;
        case '4':                                                             //месяц
            brutal ? timeFromShow.addDays(-31) : timeFromShow.monthAlignment();
            times = scaleTimeGraphic(arr, yearMonthDay , timeFromShow);
            break;
        case '5':
            if (customScale === 0) scaleFoo = daysHours;
            else if (customScale === 1) scaleFoo = daySixHours;
            else if (customScale === 2) scaleFoo = monthDays;
            else if (customScale === 3) scaleFoo = yearMonthDay;
            times = (fromTime < toTime) ? scaleTimeGraphic(arr, scaleFoo , fromTime, toTime ) : times;
            break;
        default:                                                              //всё время
            let diffDays = Math.ceil(timeFromShow - arr[0] / (1000 * 3600 * 24));
            if (diffDays <= 1) scaleFoo = hours;                                   //выбор функции-шаблона в зависимости
            else if (diffDays <= 3) scaleFoo = daySixHours;                        //от размера массива времени в днях
            else if (diffDays <= 7) scaleFoo = monthDays;
            else if (diffDays > 7) scaleFoo = yearMonthDay;
            times = scaleTimeGraphic(arr, scaleFoo, arr[0]);
    }
    return times;
}

//Функция масштабирования массива времени.
// arr - массив времени
// func - функция шаблон
// daysToShow - последняя дата для чтения с конца.

function scaleTimeGraphic(arr, func, timeFromShow, timeToShow = 0) {
    let tmpTimeFromShow = new Date(timeFromShow),
        hours = timeFromShow.getHours(),
        placeholder = {},
        date = timeToShow === 0 ? new Date() : new Date(timeToShow);
    date.setHours(hours === 0 ? 23 : hours);                        //последнее учитываемое время за день
    date.setMinutes(0);                                             //или не изменяя время для грубого режима
    date.setSeconds(0);
    while (tmpTimeFromShow < date) {                                  //Первая запись массива времени < сегодня
        tmpTimeFromShow.setHours(hours);
        hours = tmpTimeFromShow.getHours() + 1;                       //Увеличиваем счётчик первой записи на 1 час вперёд
        placeholder[func.call(tmpTimeFromShow)] = 0;        //функция-шаблон {time:'XXXX-XX/XX/XX', ...} -> {'XX.XX XX:XX' : 0, ...)
    }                                                               //формируем шаблон для Ox - объект с ключами соотвествующими функции шаблону (равномерные метки по Ox).

    /*
    console.log("1",date);               1 Mon Aug 20 2018 23:00:00 GMT+0300 (Москва, стандартное время)
    console.log("2",tmpTimeFromShow);     2 Tue Aug 21 2018 00:00:00 GMT+0300 (Москва, стандартное время)
    while (tmpTimeFromShow < date)        выполняет последнюю итерацию, однако условие не исполнено
    баг появляется редко, при повторном отображении month или week scaled
    */

    let times = [];
    for (let i = arr.length-1; i > -1; i--)                                        //Фильтруем массив времени по дате с конца
        if (arr[i] < timeFromShow) break;
        else times.push(arr[i]);
    return times.slice().reduce(function (acc, el) {
        acc[func.call(el)]++;                                                      //формируем значения с ключами соотвествующими функции шаблону
        return acc;                                                                //при совпадении ключа увеличиваем его значение на 1
    }, placeholder);                                                               //все ключи уже существуют в шаблоне - placeholder
}

//------------------------------Функции-шаблоны---------------------------------

let hours = function () {
    let hour = (this.getHours() < 10 ?  "0" : "") + this.getHours().toString();    // XXXX-XX/XX/XX XX:XX -> XX:00
    return hour + ":00";
};

let daysHours = function () {
    let hour = (this.getHours() < 10 ?  "0" : "") + this.getHours().toString(),    // XXXX-XX/XX/XX XX:XX -> XX:00
        day = (this.getDate() < 10 ?  "0" : "") + this.getDate().toString();
    return day + ' ' + hour + ":00";
};

let daySixHours = function () {                                                    // XXXX-XX/XX/XX XX:XX -> XX.XX 03:00, 09:00...
    let hour = this.getHours(),
        month = (this.getMonth()+1 < 10 ?  "0" : "") + (this.getMonth()+1).toString(),
        day = (this.getDate() < 10 ?  "0" : "") + this.getDate().toString();
    let strHour = '';
    if (hour <= 6) strHour = "03";
    else if (hour <= 12) strHour = "09";
    else if (hour <= 18) strHour = "15";
    else if (hour <= 24) strHour = "21";
    return day + "." + month + " " + strHour + ":00";
};

let monthDays = function () {                                                      // XXXX-XX/XX/XX XX:XX -> XX.XX
    let month = (this.getMonth()+1 < 10 ?  "0" : "") + (this.getMonth()+1).toString(),
        day = (this.getDate() < 10 ?  "0" : "") + this.getDate().toString();
    return day + "." + month;
};

let yearMonthDay = function () {                                                   // XXXX-XX/XX/XX XX:XX -> XX.XX.XXXX
    let year = this.getFullYear().toString(),
        month = (this.getMonth()+1 < 10 ?  "0" : "") + (this.getMonth()+1).toString(),
        day = (this.getDate() < 10 ?  "0" : "") + this.getDate().toString();
    return day + "." + month + "." + year;
};