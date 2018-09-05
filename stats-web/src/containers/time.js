import React, {Component} from 'react';
import {connect} from 'react-redux';
import LineChart from '../components/line';
import Button from '../components/button';
import Checkbox from '../components/checkbox';
import RadioButton from '../components/radiobutton';
import DateRange from '../components/daterange';
import Input from '../components/input';
import {createTimeMessage} from '../store/graphics/time/action';
import {calculateTimeScale} from "../common/timeHelpers";

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
            timeScale = calculateTimeScale(this.props.store.chat.timeReady[0]);
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

    changeTimeScale = (event) => {
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            this.props.store.timeMessage.dayScale,
            this.props.store.timeMessage.imposition,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime,
            event.target.id,
            this.props.store.timeMessage.average,
            this.props.store.timeMessage.periods
        );
    };

    createButton = (label, index) => (
        <Button className="btn btn-outline-primary btn-sm col-sm-12 col-md-2 col-lg-2 col-xl-2"
                key={index}
                id={index}
                label={label}
                onClick={this.setScale}
                active={this.props.store.timeMessage.dayScale === index.toString()}
        />
    );

    createButtons = (buttonLabels) => (
        buttonLabels.map(this.createButton)
    );

    createRadio = (label, index) => (
        <RadioButton key={index}
                     data_id={index}
                     label={label}
                     onChange={this.changeTimeScale}
                     checked={index.toString() === this.props.store.timeMessage.timeScale}
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

    createHeader = (label) => (
        <div className="header__most-active">
            <b>{label}</b>
        </div>
    );


    render() {
        const dayScale = this.props.store.timeMessage.dayScale;
        let impositionVisibility, dateRangeVisibility, timeScaleVisibility, averageVisibility, periodsVisibility,
            buttonsVisibility = dayScale;
        if (buttonsVisibility) {
            averageVisibility = dayScale !== '0';
            dateRangeVisibility = dayScale === '4';
            timeScaleVisibility = dayScale !== '1' && dayScale !== '0' && dayScale !== '0' && dayScale !== '3';
            periodsVisibility = this.props.store.timeMessage.average && averageVisibility;
            impositionVisibility = periodsVisibility;
        }
        return (
            <div className="graphich__second graphich__wrapper col-sm-12 col-md-10 col-lg-9 col-xl-7">
                {buttonsVisibility && this.createHeader("Time activity")}
                <div>
                    <LineChart data={this.props.store.timeMessage.data}
                               options={this.props.store.timeMessage.options}/>
                </div>
                <div className="wrapper flex-container btn btn__wrapper">
                    <div className="row btn__wrapper">
                        {buttonsVisibility && this.createButtons(buttonLabels)}
                    </div>
                    {dateRangeVisibility && this.createDateRange()}
                    <div>
                        {timeScaleVisibility && this.createRadios(radioLabels)}
                    </div>
                    {averageVisibility && this.createCheckbox('average', this.changeAverage, this.props.store.timeMessage.average)}
                    {impositionVisibility && this.createCheckbox('imposition', this.changeImposition, this.props.store.timeMessage.imposition)}
                    {periodsVisibility && this.createInput('periods', this.changePeriods, this.props.store.timeMessage.periods)}
                </div>
            </div>
        );
    };
}

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