import {staticColors} from '../../../common/colors';
import * as types from './actionType'

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
};

Date.prototype.monthAlignment = function() {                                                                            //1-е число месяца
    this.setDate(1);
};

Date.prototype.monthAlignmentFront = function() {                                                                            //1-е число месяца
    let day = new Date(this.getFullYear(), this.getMonth() + 1, 0);
    this.setDate(day.getDate());
};

Date.prototype.weekAlignment = function() {                                                                             //Ближайший понедельник
    let weekDays = [6, 0, 1, 2, 3, 4, 5],
        dayOfWeek = weekDays[this.getDay()];
    this.setDate(this.getDate() - dayOfWeek);
};

Date.prototype.weekAlignmentFront = function() {                                                                             //Ближайший понедельник
    let day = this.getDay();
    this.setDate(this.getDate() + 7 - day);
};

const  prepareTimeForUsers = (time, scale) => {
    let timeArray = [];
    let obj = {};
    let date = new Date(time[0].time);
    date.setHours(0);
    date.setSeconds(0);
    date.setMinutes(0);
    let n = scale === '0' ? 1 :
            scale === '1' ? 6 :
            scale === '2' ? 24 : '';
    if(scale === '1') {
        date.setDate(date.getDate() - 1);
        date.setHours(21)
    }
    for(let i =0; i<n; i++)
        date.setHours(date.getHours() + 1);
    for (let i = 0; i < time.length; i++) {
        if (new Date(time[i].time) > date) {
            console.log(obj);
            for (let user in obj)
                timeArray.push(new Date(date));
            for(let i =0; i<n; i++)
                date.setHours(date.getHours() + 1);
            obj = {};
        } else obj[time[i].user] = 0;
    }
    for (let user in obj)
        timeArray.push(new Date(date));
    return timeArray.slice();
};


export const createTimeUsers = (chat, store, messageActivity) =>
    dispatch => {
        let timeArray =  messageActivity ?
            chat.timeReady
            : prepareTimeForUsers(chat.time, store.timeScale);
        dispatch(createTimeMessage(
            timeArray,
            store.dayScale,
            store.imposition,
            store.fromTime,
            store.toTime,
            store.timeScale,
            store.average,
            store.periods,
            messageActivity,
            false,
            [],
            chat.theme
        )
    );
};

export const createTimeMessage = (timeArray, dayScale = '0', imposition = false, fromTime = 0, toTime = 0,
                                  timeScale = '0', average = false, periods = 1, messageActivity = true, chosen = false, RAWTime = [], colorPresetIndex) =>
    dispatch => {
        if(chosen) {
            let userTimes = [];
            for (let i = 0; i < RAWTime.length; i++)
                if (RAWTime[i].user === chosen)
                    userTimes.push(new Date(RAWTime[i].time));
            timeArray = userTimes.slice();
        }
        if (timeArray.length === 0) {
            let payload = createObjForReducer(
                0,[{}],0,
                dayScale, timeScale,
                fromTime, toTime,
                imposition, average, periods, messageActivity, colorPresetIndex
            );
            dispatch({type: types.SET_THIRD_ALL, payload: payload});
        }
        else {
            let preparedTimeArrays = prepareTime(timeArray, dayScale, imposition, fromTime, toTime, timeScale, average, periods),
                timeGraphicData = [];
            for (let i = preparedTimeArrays.length - 1; i > -1; i--) {
                timeGraphicData.push([]);
                if (!messageActivity) {
                    for (let time in preparedTimeArrays[i])
                        if (time !== 'label') timeGraphicData[preparedTimeArrays.length - 1 - i].push({
                            t: time,
                            y: !imposition && average ? preparedTimeArrays[i][time] / periods : preparedTimeArrays[i][time]
                        });
                } else {
                    for (let time in preparedTimeArrays[i])
                        if (time !== 'label') timeGraphicData[preparedTimeArrays.length - 1 - i].push({
                            t: time,
                            y: !imposition && average ? preparedTimeArrays[i][time] / periods : preparedTimeArrays[i][time]
                        });                                                                                 //наносим метки на Ox и Oy, не трогаем label
                }
            }
            let cfg = createObjForReducer(
                timeArray, preparedTimeArrays.reverse(), timeGraphicData,
                dayScale, timeScale,
                fromTime, toTime,
                imposition, average, periods, messageActivity,
                colorPresetIndex
            );
            dispatch({type: types.SET_THIRD_ALL, payload: cfg});
        }
    };

function createObjForReducer(timeArray, preparedTimeArray, timeGraphicData,
                             dayScale, timeScale, fromTime, toTime,
                             imposition, average, periods, messageActivity, colorPresetIndex) {
    let dataSets = [];
    let B = 20;
    let R = 235;
    let color = staticColors(colorPresetIndex);

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
            backgroundColor: color.colors[timeGraphicData.length-i-1],
            borderColor: color.colors[timeGraphicData.length-i-1],
        });
    }
    return {
        theme: color.theme,
        messageActivity : messageActivity,
        RAWTime: timeArray,
        dayScale : dayScale,
        imposition : imposition,
        timeScale: timeScale,
        fromTime: fromTime,
        toTime: toTime,
        average : average,
        periods : periods,
        data: {
            labels: preparedTimeArray[0] ? Object.keys(preparedTimeArray[0]) : [],
            datasets: dataSets
        },
        options: {
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: messageActivity ? 'сообщения' : 'пользователи'
                    }
                }]
            }
        }
    };
}

function prepareTime(arr, dayScale, imposition, fromTime, toTime, timeScale, average, periods) {
    let timeArray = [],
        scaleFoo,
        timeFromShow = fromTime != 0 ? new Date(fromTime) : new Date();
        timeFromShow.setHours(0);
        timeFromShow.setMinutes(0);
        timeFromShow.setSeconds(0);
    let timeToShow = new Date();
        timeToShow.setHours(23);
    if (timeScale === '0' && dayScale === '1') scaleFoo = hours;                                                        //подбираем функцию шаблон, в зависимости от
    else if (timeScale === '0' ) scaleFoo =  average ? hours : daysHours;
    else if (timeScale === '1' && dayScale === '3') scaleFoo = daySixHours;                                             //масштабирования и вида графика (average)
    else if (timeScale === '1') scaleFoo = daysOfWeekSixHours;
    else if (timeScale === '2' && dayScale === '0') scaleFoo =   monthDays ;
    else if (timeScale === '2') scaleFoo = average  ? days : dayOfMonth ;
    switch (dayScale) {
        case '1':                                                                                                       //день
            if (average) {
                if (imposition) {
                    for (let i = 0; i < periods; i++) {
                        timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                        timeArray[i].label = monthDays.call(timeFromShow);
                        timeFromShow.addDays(-1);
                        timeToShow = new Date(timeFromShow);
                        timeToShow.setHours(23);
                    }
                } else {
                    timeFromShow.addDays(-1 * (periods - 1));
                    timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow));
                    let timeFromShowStr = monthDays.call(timeFromShow),
                        timeToShowStr = monthDays.call(timeToShow);
                    timeArray[0].label = (timeFromShowStr === timeToShowStr)
                        ? timeToShowStr
                        : timeFromShowStr +' - '+ timeToShowStr;

                }
            } else {
                timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow));
                timeArray[0].label = hours.call(timeFromShow) + " - " + hours.call(timeToShow);
            }
            break;
        case '2':                                                                                                       //неделя
            if (timeScale === '0') scaleFoo = daysOfWeekHours;
            timeFromShow.weekAlignment();
            if (average) {
                if (timeScale === '2') scaleFoo = daysOfWeek;
                timeToShow.weekAlignmentFront();
                if (imposition) {
                    for (let i = 0; i < periods; i++) {
                        timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                        timeArray[i].label = monthDays.call(timeFromShow) + " - " + monthDays.call(timeToShow);
                        timeToShow = new Date(timeFromShow);
                        timeToShow.addDays(-1);
                        timeToShow.setHours(23);
                        timeFromShow.addDays(-7);
                    }
                } else {
                    timeFromShow.addDays(-7 * (periods-1));
                    timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                    timeArray[0].label = monthDays.call(timeFromShow) + " - " + monthDays.call(timeToShow);
                }
            } else {
                timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, new Date()));
                timeArray[0].label = monthDays.call(timeFromShow) + " - " + monthDays.call(timeToShow);
            }
            break;
        case '3':
            timeFromShow.monthAlignment();                                                                              //месяц
            if (average) {
                timeToShow.monthAlignmentFront();
                if (imposition) {
                    for (let i = 0; i < periods; i++) {
                        timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                        timeArray[i].label = monthDays.call(timeFromShow) + " - " + monthDays.call(timeToShow);
                        timeToShow = new Date(timeFromShow);
                        timeToShow.addDays(-1);
                        timeToShow.setHours(23);
                        timeFromShow.addDays(-31);
                    }
                } else {
                    timeFromShow.addDays(-31 * (periods - 1));
                    timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                    timeArray[0].label = monthDays.call(timeFromShow) + " - " + monthDays.call(timeToShow);
                }
            } else {
                timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                timeArray[0].label = dayOfMonth.call(timeFromShow) + " - " + dayOfMonth.call(timeToShow);
            }
            break;
        case '4':                                                                                                       //пользовательское время
            if (fromTime < toTime || fromTime !== 0) {
                timeFromShow = new Date(fromTime);
                timeToShow = new Date(toTime);
                timeFromShow.setHours(0);
                timeFromShow.setMinutes(0);
                timeFromShow.setSeconds(0);
               // timeToShow.setHours(23);
                timeToShow.setMinutes(0);
                timeToShow.setSeconds(0);
                let diffDays = Math.ceil((timeToShow - timeFromShow) / (1000 * 3600 * 24));
                if (average) {
                    if (timeScale === '0')
                        scaleFoo = hours;
                    if (timeScale === '1')
                        scaleFoo = sixHours;
                    if (timeScale === '2')
                        scaleFoo = daysOfWeek;
                    if (imposition)
                        for (let i = 0; i < periods; i++) {
                            timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                            let timeFromShowStr = monthDays.call(timeFromShow),
                                timeToShowStr = monthDays.call(timeToShow);
                            timeArray[i].label = (timeFromShowStr === timeToShowStr) ? timeToShowStr
                                : timeFromShowStr +' - '+ timeToShowStr;
                            timeToShow = new Date(timeFromShow);
                            timeToShow.addDays(-1);
                            timeToShow.setHours(23);
                            timeFromShow.addDays(-diffDays);
                        }
                    else {
                        let timeFromShowStr = monthDays.call(timeFromShow),
                            timeToShowStr = monthDays.call(timeToShow),
                            label = (timeFromShowStr === timeToShowStr) ? timeToShowStr
                            : timeFromShowStr +' - '+ timeToShowStr;
                        timeFromShow.addDays((-diffDays) * (periods - 1));
                        timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                        timeArray[0].label = label;
                    }
                } else {
                    timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow, timeToShow));
                    let timeFromShowStr = monthDays.call(timeFromShow),
                        timeToShowStr = monthDays.call(timeToShow);
                    timeArray[0].label = (timeFromShowStr === timeToShowStr) ? timeToShowStr
                        : timeFromShowStr +' - '+ timeToShowStr;
                }
            } else
                timeArray.push({label:'Укажите время'});
            break;
        default:                                                                                                        //всё время
            timeArray.push(scaleTimeGraphic(arr, scaleFoo, arr[0], new Date()));
            timeArray[0].label = monthDays.call(arr[0]) + " - " + monthDays.call(timeToShow);
    }
    return timeArray;
}

//Функция масштабирования массива времени.
// arr - массив времени
// func - функция шаблон

function scaleTimeGraphic(arr, func, timeFromShow, timeToShow = 0) {
    let tmpTimeFromShow = new Date(timeFromShow),
        hours = tmpTimeFromShow.getHours(),
        placeholder = {},
        date = timeToShow === 0 ? new Date(arr[arr.length-1]) : new Date(timeToShow);//последнее учитываемое время за день
    while (tmpTimeFromShow < date) {                                               //Первая запись массива времени < последнее учитываемое время за день
        tmpTimeFromShow.setHours(hours);
        hours = tmpTimeFromShow.getHours() + 1;                                    //Увеличиваем счётчик первой записи на 1 час вперёд
        placeholder[func.call(tmpTimeFromShow)] = 0;                               // функция-шаблон {time:'XXXX-XX/XX/XX', ...} -> {'XX.XX XX:XX' : 0, ...)
    }                                                                              //формируем шаблон для Ox - объект с ключами соотвествующими функции шаблону (равномерные метки по Ox).
    let times = [];
    date.setMinutes(59);                                                           //или не изменяя время для грубого режима
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

function days () {
    return this.getDate();
}

function daysHours() {
    let hour = (this.getHours() < 10 ?  "0" : "") + this.getHours().toString(),    // XXXX-XX/XX/XX XX:XX -> XX:00
        day = (this.getDate() < 10 ?  "0" : "") + this.getDate().toString();
    return day + ' ' + hour + ":00";
}

function daySixHours() {                                                           // XXXX-XX/XX/XX XX:XX -> XX.XX 03:00, 09:00...
    let hour = this.getHours(),
        day = (this.getDate() < 10 ?  "0" : "") + this.getDate().toString();
    let strHour = '';
    if (hour <= 6) strHour = "03";
    else if (hour <= 12) strHour = "09";
    else if (hour <= 18) strHour = "15";
    else if (hour <= 24) strHour = "21";
    return day + " " + strHour + ":00";
}

function sixHours() {                                                           // XXXX-XX/XX/XX XX:XX -> XX.XX 03:00, 09:00...
    let hour = this.getHours(),
        strHour = '';
    if (hour <= 6) strHour = "03";
    else if (hour <= 12) strHour = "09";
    else if (hour <= 18) strHour = "15";
    else if (hour <= 24) strHour = "21";
    return strHour + ":00";
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

function daysOfWeekHours () {
    let hour = (this.getHours() < 10 ?  "0" : "") + this.getHours().toString();    // XXXX-XX/XX/XX XX:XX -> XX:00
    let weekDays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
    return weekDays[this.getDay()] + " " + hour + ":00";
}

function daysOfWeek () {
    let weekDays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
    return weekDays[this.getDay()];
}

function dayOfMonth() {
    let weekDays = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
        dayOfWeek = weekDays[this.getDay()],
        dayOfMonth = this.getDate();
    return dayOfWeek + " " + dayOfMonth
}