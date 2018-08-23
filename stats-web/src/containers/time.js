import React, {Component} from 'react';
import {connect} from 'react-redux';
import LineChart from '../components/line';
import Button from '../components/button';
import Checkbox from '../components/checkbox';
import RadioButton from '../components/radiobutton';
import DateRange from '../components/datepicker';
import {createTimeMessage} from '../store/graphics/time/action';

const buttonLabels = [
    ' all time ',
    ' today ',
    ' 3 days ',
    ' week ',
    ' month ',
    ' custom '
];

const radioLabels = [
    ' hours ',
    ' days for 6 hours ',
    ' month with day ',
    ' year-month-day '
];

class TimeMessageGraphic extends Component {

    setScale = (event) => {
        let timeScale = this.props.store.timeMessage.timeScale;
        if(event.target.id === '0') timeScale = calculateTimeScale(this.props.store.stats[event.target.id].timeReady[0]);
        else if(event.target.id === '1') timeScale = '0';
        else if(event.target.id === '2' || event.target.id === '3') timeScale = '1';
        else if(event.target.id === '4') timeScale = '2';
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            event.target.id,
            this.props.store.timeMessage.brutal,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime,
            timeScale
            );
    };

    changeBrutal = () => {
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            this.props.store.timeMessage.scale,
            !this.props.store.timeMessage.brutal,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime,
            this.props.store.timeMessage.timeScale
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

    createCheckbox = (label, event) => (
        <Checkbox
            label={label}
            onChange={event}/>
    );

    createDateRange = (label, event) => (
        <DateRange/>
    );


    render() {
        const dayScale = this.props.store.timeMessage.scale;
        let brutalVisibility, dateRangeVisibility, timeScaleVisibility,
            buttonsVisibility = dayScale;
        if (buttonsVisibility) {
            dateRangeVisibility = dayScale === '5';
            timeScaleVisibility = dayScale !== '1';
            brutalVisibility = dayScale !== '0' && dayScale !== '5';
        }
        return (
            <div>
                <div>
                    {buttonsVisibility && this.createButtons(buttonLabels)}
                </div>
                    {brutalVisibility && this.createCheckbox('brutal', this.changeBrutal)}
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
         setDataThirdGraphic: (time, scale, brutal, fromTime = null, toTime = null, customScale = null) => {
            dispatch(createTimeMessage(time, scale, brutal, fromTime, toTime, customScale))
        }
    })
)(TimeMessageGraphic)