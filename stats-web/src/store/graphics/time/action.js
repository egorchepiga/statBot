import * as types from './actionType'
import colors from '../../../etc/color'
//let moment = require('moment');
//moment.locale('ru');


Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
};

Date.prototype.monthAlignment = function() {                                                                            //1-е число месяца
    this.setDate(1);
};

Date.prototype.weekAlignment = function() {                                                                             //Ближайший понедельник
    let weekDays = [6, 0, 1, 2, 3, 4, 5],
        dayOfWeek = weekDays[this.getDay()];
    this.setDate(this.getDate() - dayOfWeek);
};

export const createTimeMessage = (timeArray, dayScale = '0', imposition = false, fromTime = 0, toTime = 0,
                                  timeScale = '0', average = false, periods = 1 ) =>
    dispatch => {
        let preparedTimeArrays = prepareTime(timeArray, dayScale, imposition, fromTime, toTime, timeScale, average, periods),
            timeGraphicData = [];
        for (let i = 0; i < preparedTimeArrays.length; i++) {
            timeGraphicData.push([]);
            for (let time in preparedTimeArrays[i])
                if(time !== 'label') timeGraphicData[i].push({t: time, y: preparedTimeArrays[i][time]});       //наносим метки на Ox и Oy, не трогаем label
        }
        let cfg = createObjForReducer(
            timeArray, preparedTimeArrays, timeGraphicData,
            dayScale, timeScale,
            fromTime, toTime,
            imposition, average, periods
        );
        dispatch({type: types.SET_THIRD_ALL, payload: cfg});
    };

function createObjForReducer(timeArray, preparedTimeArray, timeGraphicData, dayScale, timeScale, fromTime, toTime, imposition, average, periods) {
    let dataSets = [];
    let B = 20;
    let R = 235;
    for (let i = 0; i < timeGraphicData.length; i++) {
        B = B < R ? B + 30 : B;
        R = B > R ? R - 30 : R;
        let label = preparedTimeArray[i].label;
        delete preparedTimeArray[i].label;
        dataSets.push({
            label: label,
            data: timeGraphicData[i],
            pointRadius: 4,
            fill: false,
            borderWidth: 2,
            lineTension: 0,
            backgroundColor: 'rgba('+R+',20,'+B+', 0.6)',
            borderColor: 'rgba('+R+',20,'+B+',1)'
        });
    }
    return {
        RAWTime: timeArray,
        dayScale : dayScale,
        imposition : imposition,
        timeScale: timeScale,
        fromTime: fromTime,
        toTime: toTime,
        average : average,
        periods : periods,
        data: {
            labels: Object.keys(preparedTimeArray[0]),
            datasets: dataSets
        },
        options: {
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'время'
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
}

function prepareTime(arr, dayScale, imposition, fromTime, toTime, timeScale, average, periods) {
    let timeArray = [],
        scaleFoo,
        timeFromShow = new Date();
        timeFromShow.setHours(0);
        timeFromShow.setMinutes(0);
        timeFromShow.setSeconds(0);
    let timeToShow = new Date(timeFromShow);
        timeToShow.setHours(23);
    if (timeScale === '0' && dayScale === '1') scaleFoo = hours;                                                        //подбираем функцию шаблон, в зависимости от
    else if (timeScale === '0' ) scaleFoo =  average ? hours : daysHours;                                               //масштабирования и вида графика (average)
    else if (timeScale === '1') scaleFoo = average ? daysOfWeekSixHours : daySixHours;
    else if (timeScale === '2') scaleFoo = average  ? dayOfMonth : monthDays;
    //else if (timeScale === '3') scaleFoo = yearMonthDay;
    switch (dayScale) {
        case '1':                                                                                                       //день
            if (average) {
                if (imposition) {
                    for (let i = 0; i < periods; i++) {
                        timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                        timeArray[i].label = monthDays.call(timeFromShow) + " - " + monthDays.call(timeToShow);
                        timeFromShow.addDays(-1);
                        timeToShow = new Date(timeFromShow);
                        timeToShow.setHours(23);
                    }
                } else {
                    timeFromShow.addDays(-1 * (periods - 1));
                    timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow));
                    timeArray[0].label = monthDays.call(timeFromShow) + " - " + monthDays.call(timeToShow);

                }
            } else {
                timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow));
                timeArray[0].label = hours.call(timeFromShow) + " - " + hours.call(timeToShow);
            }
            break;
        case '2':                                                                                                       //неделя
            if (average) {
                if (imposition) {
                    timeFromShow.weekAlignment();
                    for (let i = 0; i < periods; i++) {
                        timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                        timeArray[i].label = daysHours.call(timeFromShow) + " - " + daysHours.call(timeToShow);
                        timeFromShow.addDays(-7);
                        timeToShow = new Date(timeFromShow);
                        timeToShow.setHours(23);
                    }
                } else {
                    timeFromShow.weekAlignment();
                    timeFromShow.addDays(-7 * (periods-1));
                    timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow));
                    timeArray[0].label = daysHours.call(timeFromShow) + " - " + daysHours.call(timeToShow);
                }
            } else {
                timeFromShow.weekAlignment();
                timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow));
                timeArray[0].label = daysHours.call(timeFromShow) + " - " + daysHours.call(timeToShow);
            }
            break;
        case '3':                                                                  //месяц
            if (average) {
                if (imposition) {
                    timeFromShow.monthAlignment();
                    for (let i = 0; i < periods; i++) {
                        timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                        timeArray[i].label = daysHours.call(timeFromShow) + " - " + daysHours.call(timeToShow);
                        timeFromShow.addDays(-31);
                        timeToShow = new Date(timeFromShow);
                        timeToShow.setHours(23);
                    }
                } else {
                    timeFromShow.monthAlignment();
                    timeFromShow.addDays(-31 * (periods - 1));
                    timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow));
                    timeArray[0].label = daysHours.call(timeFromShow) + " - " + daysHours.call(timeToShow);
                }
            } else {
                timeFromShow.monthAlignment();
                timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow));
                timeArray[0].label = daysHours.call(timeFromShow) + " - " + daysHours.call(timeToShow);
            }
            break;
        case '4':                                                                                                       //пользовательское время
            if (fromTime < toTime || fromTime !== 0) {
                timeFromShow = new Date(fromTime);
                timeToShow = new Date(toTime);
                timeFromShow.setHours(0);
                timeFromShow.setMinutes(0);
                timeFromShow.setSeconds(0);
                timeToShow.setHours(23);
                timeToShow.setMinutes(0);
                timeToShow.setSeconds(0);
                let diffDays = Math.ceil((timeToShow - timeFromShow) / (1000 * 3600 * 24));
                if (average) {
                    if (imposition)
                        for (let i = 0; i < periods; i++) {
                            timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                            timeArray[i].label = daysHours.call(timeFromShow) + " - " + daysHours.call(timeToShow);
                            timeFromShow.addDays(-diffDays);
                            timeToShow = new Date(timeFromShow);
                            timeToShow.setHours(23);
                        }
                    else {
                        timeFromShow.addDays((-diffDays) * (periods - 1));
                        timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                        timeArray[0].label = daysHours.call(timeFromShow) + " - " + daysHours.call(timeToShow);
                    }
                } else {
                    timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                    timeArray[0].label = daysHours.call(timeFromShow) + " - " + daysHours.call(timeToShow);
                }
            } else
                timeArray.push({label:'Укажите время'});
            break;
        default:                                                                                                        //всё время
            timeArray.push(scaleTimeGraphic(arr, scaleFoo, arr[0]));
            timeArray[0].label = monthDays.call(arr[0]) + " - " + monthDays.call(timeToShow);;
    }
    return timeArray;
}

//Функция масштабирования массива времени.
// arr - массив времени
// func - функция шаблон

function scaleTimeGraphic(arr, func, timeFromShow, timeToShow = 0) {
    let tmpTimeFromShow = new Date(timeFromShow),
        hours = timeFromShow.getHours(),
        placeholder = {},
        date = timeToShow === 0 ? new Date() : new Date(timeToShow);
    date.setHours(23);                                       //последнее учитываемое время за день
    date.setMinutes(0);                                                            //или не изменяя время для грубого режима
    date.setSeconds(0);
    while (tmpTimeFromShow < date) {                                               //Первая запись массива времени < последнее учитываемое время за день
        tmpTimeFromShow.setHours(hours);
        hours = tmpTimeFromShow.getHours() + 1;                                    //Увеличиваем счётчик первой записи на 1 час вперёд
        placeholder[func.call(tmpTimeFromShow)] = 0;                               // функция-шаблон {time:'XXXX-XX/XX/XX', ...} -> {'XX.XX XX:XX' : 0, ...)
    }                                                                              //формируем шаблон для Ox - объект с ключами соотвествующими функции шаблону (равномерные метки по Ox).
    let times = [];
    date.setMinutes(59);                                                            //или не изменяя время для грубого режима
    date.setSeconds(59);
    for (let i = arr.length-1; i > -1; i--) {                                      //Фильтруем массив времени по дате с конца
        if (arr[i] < timeFromShow) break;
        else if (arr[i] < date) times.push(new Date(arr[i]));
    }
    return times.reduce(function (acc, el) {
        if(placeholder.hasOwnProperty(func.call(el)))
            acc[func.call(el)]++;                                                  //формируем значения с ключами соотвествующими функции шаблону
        return acc;                                                                //при совпадении ключа увеличиваем его значение на 1
    }, placeholder);                                                               //все ключи уже существуют в шаблоне - placeholder
}

//------------------------------Функции-шаблоны---------------------------------

function hours () {
    let hour = (this.getHours() < 10 ?  "0" : "") + this.getHours().toString();    // XXXX-XX/XX/XX XX:XX -> XX:00
    return hour + ":00";
}

function daysHours() {
    let hour = (this.getHours() < 10 ?  "0" : "") + this.getHours().toString(),    // XXXX-XX/XX/XX XX:XX -> XX:00
        day = (this.getDate() < 10 ?  "0" : "") + this.getDate().toString();
    return day + ' ' + hour + ":00";
}

function daySixHours() {                                                           // XXXX-XX/XX/XX XX:XX -> XX.XX 03:00, 09:00...
    let hour = this.getHours(),
        month = (this.getMonth()+1 < 10 ?  "0" : "") + (this.getMonth()+1).toString(),
        day = (this.getDate() < 10 ?  "0" : "") + this.getDate().toString();
    let strHour = '';
    if (hour <= 6) strHour = "03";
    else if (hour <= 12) strHour = "09";
    else if (hour <= 18) strHour = "15";
    else if (hour <= 24) strHour = "21";
    return day + "." + month + " " + strHour + ":00";
}

function monthDays() {                                                             // XXXX-XX/XX/XX XX:XX -> XX.XX
    let month = (this.getMonth()+1 < 10 ?  "0" : "") + (this.getMonth()+1).toString(),
        day = (this.getDate() < 10 ?  "0" : "") + this.getDate().toString();
    return day + "." + month;
}

function yearMonthDay() {                                                          // XXXX-XX/XX/XX XX:XX -> XX.XX.XXXX
    let year = this.getFullYear().toString(),
        month = (this.getMonth()+1 < 10 ?  "0" : "") + (this.getMonth()+1).toString(),
        day = (this.getDate() < 10 ?  "0" : "") + this.getDate().toString();
    return day + "." + month + "." + year;
};

function daysOfWeekSixHours () {
    let weekDays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
        dayOfWeek = weekDays[this.getDay()],
        hour = this.getHours(),
        strHour = '';
    if (hour <= 6) strHour = "03";
    else if (hour <= 12) strHour = "09";
    else if (hour <= 18) strHour = "15";
    else if (hour <= 24) strHour = "21";
    return dayOfWeek + " " + strHour + ":00"
}

function dayOfMonth() {
    let weekDays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
        dayOfWeek = weekDays[this.getDay()],
        dayOfMonth = this.getDate();
    return dayOfWeek + " " + dayOfMonth
}