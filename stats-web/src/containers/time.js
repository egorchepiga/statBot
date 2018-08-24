import React, {Component} from 'react';
import {connect} from 'react-redux';
import LineChart from '../components/line';
import Button from '../components/button';
import Checkbox from '../components/checkbox';
import RadioButton from '../components/radiobutton';
import DateRange from '../components/datepicker';
import Input from '../components/input';
import {createTimeMessage} from '../store/graphics/time/action';

const buttonLabels = [
    ' all time ',
    ' today ',
    ' week ',
    ' month ',
    ' custom '
];

const radioLabels = [
    ' hours ',
    ' days for 6 hours ',
    ' month with day '
];

class TimeMessageGraphic extends Component {

    setScale = (event) => {
        let timeScale = this.props.store.timeMessage.timeScale,
            average = this.props.store.timeMessage.average;
        if(event.target.id === '0') {
            timeScale = calculateTimeScale(this.props.store.stats[event.target.id].timeReady[0])
            average = false;
        }
        else if(event.target.id === '1') timeScale = '0';
        else if(event.target.id === '2' ) timeScale = '1';
        else if(event.target.id === '3' || event.target.id === '4' ) timeScale = '2';
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            event.target.id,
            this.props.store.timeMessage.imposition,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime,
            timeScale,
            average,
            this.props.store.timeMessage.periods
            );
    };

    changeImposition = () => {
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            this.props.store.timeMessage.dayScale,
            !this.props.store.timeMessage.imposition,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime,
            this.props.store.timeMessage.timeScale,
            this.props.store.timeMessage.average,
            this.props.store.timeMessage.periods
        );
    };

    changeAverage = () => {
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            this.props.store.timeMessage.dayScale,
            this.props.store.timeMessage.imposition,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime,
            this.props.store.timeMessage.timeScale,
            !this.props.store.timeMessage.average,
            this.props.store.timeMessage.periods
        );
    };

    changePeriods = (event) => {
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            this.props.store.timeMessage.dayScale,
            this.props.store.timeMessage.imposition,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime,
            this.props.store.timeMessage.timeScale,
            this.props.store.timeMessage.average,
            event.target.value > 0 ? event.target.value : 1,
        );
    };

    createButton = (label, index) => (
        <Button key={index}
                id={index}
                label={label}
                onClick={this.setScale}
        />
    );

    createButtons = (buttonLabels) => (
        buttonLabels.map(this.createButton)
    );

    createRadio = (label, index) => (
        <RadioButton key={index}
                     data_id={index.toString()}
                     label={label}
        />
    );

    createRadios = (radioLabels) => (
        radioLabels.map(this.createRadio)
    );

    createCheckbox = (label, event, checked = false) => (
        <Checkbox
            label={label}
            onChange={event}
            checked={checked}/>
    );

    createDateRange = () => (
        <DateRange/>
    );

    createInput = (label, event, value) => (
        <Input
            label={label}
            onChange={event}
            value={value}/>
    );


    render() {
        const dayScale = this.props.store.timeMessage.dayScale;
        let impositionVisibility, dateRangeVisibility, timeScaleVisibility, averageVisibility, periodsVisibility,
            buttonsVisibility = dayScale;
        if (buttonsVisibility) {
            averageVisibility = dayScale !== '0';
            dateRangeVisibility = dayScale === '4';
            timeScaleVisibility = dayScale !== '1' && dayScale !== '0';
            periodsVisibility = this.props.store.timeMessage.average && averageVisibility;
            impositionVisibility = periodsVisibility;
        }
        return (
            <div>
                <div>
                    {buttonsVisibility && this.createButtons(buttonLabels)}
                    {averageVisibility && this.createCheckbox('average', this.changeAverage, this.props.store.timeMessage.average)}
                    {impositionVisibility && this.createCheckbox('imposition', this.changeImposition, this.props.store.timeMessage.imposition)}
                    {periodsVisibility && this.createInput('periods', this.changePeriods, this.props.store.timeMessage.periods)}
                </div>
                    {dateRangeVisibility && this.createDateRange()}
                <div>
                    {timeScaleVisibility && this.createRadios(radioLabels)}
                </div>
                <LineChart data={this.props.store.timeMessage.data}
                            options={this.props.store.timeMessage.options}/>
            </div>
        );
    };
}

let calculateTimeScale = (day) => {
    let timeFromShow = new Date();
    timeFromShow.setHours(0);
    timeFromShow.setMinutes(0);
    timeFromShow.setSeconds(0);
    let timeToShow = new Date(day),
        timeScale,
        diffDays = Math.ceil((timeFromShow - timeToShow) / (1000 * 3600 * 24));
    if (diffDays <= 1) timeScale = '0';
    else if (diffDays <= 3) timeScale = '1';
    else if (diffDays <= 7) timeScale = '2';
    else if (diffDays > 7) timeScale = '2';
    return timeScale;
};

export default connect(
    state => ({
        store: state
    }),
    dispatch => ({
         setDataThirdGraphic: (time, dayScale, imposition, fromTime = null, toTime = null, customScale = null, average = false, periods = 1) => {
            dispatch(createTimeMessage(time, dayScale, imposition, fromTime, toTime, customScale, average, periods))
        }
    })
)(TimeMessageGraphic)