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

export const createTimeUsers = (chat, store, messageActivity) =>
    dispatch => {
    console.log(messageActivity);
        let timeArray = [];
        if (messageActivity) timeArray = chat.timeReady;
        else {
            let hours;
            let date = new Date(chat.time[0].time);
            date.setHours(0);
            date.setSeconds(0);
            date.setMinutes(0);
            let obj = {};
            switch (store.timeScale) {
                case '0' :
                    hours = new Date(chat.time[0].time).getHours() + 1;
                    date.setHours(hours);
                    for (let i = 0; i < chat.time.length; i++) {
                        obj[chat.time[i].user] = 0;
                        if (new Date(chat.time[i].time) > date) {
                            for (let user in obj)
                                timeArray.push(new Date(date));
                            hours = date.getHours() + 1;
                            date.setHours(hours);
                            obj = {};
                        }
                    }
                    break;
                case '1' :                                          //spaghetti
                    for(let i = 0; i < 6; i++) {
                        hours = date.getHours() + 1;
                        date.setHours(hours);
                    }
                    for (let i = 0; i < chat.time.length; i++) {
                        obj[chat.time[i].user] = 0;
                        if (new Date(chat.time[i].time) > date) {
                            for (let user in obj)
                                timeArray.push(new Date(date));
                            for(let i = 0; i < 6; i++) {
                                hours = date.getHours() + 1;
                                date.setHours(hours);
                            }
                            obj = {};
                        }
                    }
                    break;
                case '2' :
                    for (let i = 0; i < chat.time.length; i++) {
                        obj[chat.time[i].user] = 0;
                        if (new Date(chat.time[i].time) > date) {
                            for (let user in obj)
                                timeArray.push(new Date(date));
                            date.addDays(1);
                            console.log(obj);
                            obj = {};
                        }
                    }
                    break;
            }
        }

        dispatch(createTimeMessage(
            timeArray,
            store.dayScale,
            store.imposition,
            store.fromTime,
            store.toTime,
            store.timeScale,
            store.average,
            store.periods,
            messageActivity
        )
    );
};

export const createTimeMessage = (timeArray, dayScale = '0', imposition = false, fromTime = 0, toTime = 0,
                                  timeScale = '0', average = false, periods = 1, messageActivity = true ) =>
    dispatch => {
        let preparedTimeArrays = prepareTime(timeArray, dayScale, imposition, fromTime, toTime, timeScale, average, periods),
            timeGraphicData = [];
        for (let i = preparedTimeArrays.length-1; i > -1; i--) {
            timeGraphicData.push([]);
            if (!messageActivity) {
                for (let time in preparedTimeArrays[i])
                    if (time !== 'label') timeGraphicData[preparedTimeArrays.length - 1 - i].push({
                        t: time,
                        y: Math.ceil(preparedTimeArrays[i][time]/periods)
                    });
            } else {
                for (let time in preparedTimeArrays[i])
                    if (time !== 'label') timeGraphicData[preparedTimeArrays.length - 1 - i].push({
                        t: time,
                        y: preparedTimeArrays[i][time]
                    });                                                                                 //наносим метки на Ox и Oy, не трогаем label
            }
        }
        let cfg = createObjForReducer(
            timeArray, preparedTimeArrays.reverse(), timeGraphicData,
            dayScale, timeScale,
            fromTime, toTime,
            imposition, average, periods, messageActivity
        );
        dispatch({type: types.SET_THIRD_ALL, payload: cfg});
    };

function createObjForReducer(timeArray, preparedTimeArray, timeGraphicData, dayScale, timeScale, fromTime, toTime, imposition, average, periods, messageActivity) {
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
            labels: Object.keys(preparedTimeArray[0]),
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
        timeFromShow = new Date();
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
                timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow));
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
                timeArray.push(scaleTimeGraphic(arr, scaleFoo, timeFromShow));
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
                timeToShow.setHours(23);
                timeToShow.setMinutes(0);
                timeToShow.setSeconds(0);
                let diffDays = Math.ceil((timeToShow - timeFromShow) / (1000 * 3600 * 24));
                if (average) {
                    if (diffDays * periods < 32) scaleFoo = daysOfWeek;
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
            timeArray.push(scaleTimeGraphic(arr, scaleFoo, arr[0]));
            timeArray[0].label = monthDays.call(arr[0]) + " - " + monthDays.call(timeToShow);;
    }
    return timeArray;
}

//Функция масштабирования массива времени.
// arr - массив времени
// func - функция шаблон

function scaleTimeGraphic(arr, func, timeFromShow, timeToShow = 0) {
    timeFromShow.setHours(0);
    timeFromShow.setMinutes(0);
    timeFromShow.setSeconds(0);
    let tmpTimeFromShow = new Date(timeFromShow),
        hours = 0,
        placeholder = {},
        date = timeToShow === 0 ? new Date() : new Date(timeToShow);
    date.setHours(23);                                                             //последнее учитываемое время за день
    date.setMinutes(0);                                                            //или не изменяя время для грубого режима
    date.setSeconds(0);
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