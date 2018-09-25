import React, {Component} from 'react';
import {connect} from 'react-redux';
import LineChart from '../components/line';
import Button from '../components/button';
import Checkbox from '../components/checkbox';
import RadioButton from '../components/radiobutton';
import DateRange from '../components/daterange';
import Input from '../components/input';
import {createTimeMessage, createTimeUsers} from '../store/graphics/time/action';
import {calculateTimeScale} from "../common/timeHelpers";
import SwitchButton from "../components/switchbutton"

const dayScaleLabels = [
    ' all time ',
    ' today ',
    ' week ',
    ' month ',
    ' custom '
];

const timeScaleLabels = [
    ' hour ',
    ' 6 hours ',
    ' days '
];

class TimeMessageGraphic extends Component {

    setScale = (event) => {
        let timeScale = this.props.store.timeMessage.timeScale,
            average = this.props.store.timeMessage.average;
        if(event.target.id[0] === '0') {
            timeScale = calculateTimeScale(this.props.store.chat.timeReady[0]);
            average = false;
        }
        else if(event.target.id[0] === '1') timeScale = '0';
        else if(event.target.id[0] === '2' ) timeScale = '1';
        else if(event.target.id[0] === '3' || event.target.id[0] === '4' ) timeScale = '2';
        if(!this.props.store.timeMessage.messageActivity) {
            let obj = this.props.store.timeMessage;
            obj.dayScale = event.target.id[0];
            obj.timeScale = timeScale;
            obj.average = average;
            this.props.createTimeUsers(
                this.props.store.chat,
                obj,
                this.props.store.timeMessage.messageActivity);
        }
        else
            this.props.setDataThirdGraphic(
                this.props.store.timeMessage.RAWTime,
                event.target.id[0],
                this.props.store.timeMessage.imposition,
                this.props.store.timeMessage.fromTime,
                this.props.store.timeMessage.toTime,
                timeScale,
                average,
                this.props.store.timeMessage.periods,
                this.props.store.timeMessage.messageActivity,
                this.props.store.chosen,
                this.props.store.chat.time,
                this.props.store.timeMessage.theme
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
            this.props.store.timeMessage.periods,
            this.props.store.timeMessage.messageActivity,
            this.props.store.chosen,
            this.props.store.chat.time,
            this.props.store.timeMessage.theme
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
            this.props.store.timeMessage.periods,
            this.props.store.timeMessage.messageActivity,
            this.props.store.chosen,
            this.props.store.chat.time,
            this.props.store.timeMessage.theme
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
            this.props.store.timeMessage.messageActivity,
            this.props.store.chosen,
            this.props.store.chat.time,
            this.props.store.timeMessage.theme
        );
    };

    changeTimeScale = (event) => {
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            this.props.store.timeMessage.dayScale,
            this.props.store.timeMessage.imposition,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime,
            event.target.id[0],
            this.props.store.timeMessage.average,
            this.props.store.timeMessage.periods,
            this.props.store.timeMessage.messageActivity,
            this.props.store.chosen,
            this.props.store.chat.time,
            this.props.store.timeMessage.theme
        );
    };

    createButton = (label, index) => (
        <Button className="btn-fr btn-sm col-3 col-sm-2 col-md-2 col-lg-2 col-xl-2"
                key={index}
                id={index}
                label={label}
                onClick={this.setScale}
                active={this.props.store.timeMessage.dayScale === index.toString()}
                theme={this.props.store.timeMessage.theme}
        />
    );

    averageButton = (label, index) => (
        <div className="btn-group average-btn-group">
            <button className="btn">No</button>
            <button className="btn">Yes</button>
        </div>
    );

    createButtons = (buttonLabels) => (
        buttonLabels.map(this.createButton)
    );

    createTimeScaleRadio = (label, index) => (
        <div className="col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4 scale-radio">
            <RadioButton className={this.props.store.timeMessage.theme + "TimeRadio TimeRadio"}
                         key={index}
                         data_id={index+'timeRadio'}
                         label={label}
                         onChange={this.changeTimeScale}
                         checked={index.toString() === this.props.store.timeMessage.timeScale}
            />
        </div>
    );

    createTimeScaleRadios = (radioLabels) => (
        <div className="col-12 col-sm-12 col-md-12 col-lg-9 col-xl-9 row">
            {radioLabels.map(this.createTimeScaleRadio)}
        </div>
    );

    createDayScaleRadio = (label, index) => (
        <div className="col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4 scale-radio">
            <RadioButton className={this.props.store.timeMessage.theme + "TimeRadio TimeRadio"}
                         key={index+label}
                         data_id={index+label}
                         label={label}
                         onChange={this.setScale}
                         checked={this.props.store.timeMessage.dayScale === index.toString()}
            />
        </div>
    );

    createDayScaleRadios = (radioLabels) => (
        <div className="col-12 col-sm-12 col-md-12 col-lg-9 col-xl-9 row">
            {radioLabels.map(this.createDayScaleRadio)}
        </div>
    );

    createCheckbox = (label, event, checked = false) => (
        <Checkbox
            className={this.props.store.timeMessage.theme +'CheckBox'}
            id={label}
            label={label}
            onChange={event}
            checked={checked}
        />
    );

    createDateRange = () => (
            <DateRange/>
    );

    createInput = (label, event, value) => (
        <Input
            className="periods-input"
            label={label}
            onChange={event}
            value={value}/>
    );

    createHeader = (label) => (
        <div className="header__most-active">
            <b>{label}</b>
        </div>
    );

    activitySwitcher = () => (
        <SwitchButton
            className="activity-switch"
            labelLeft="Messages" labelRight="Users"
            key="202"
            id="202"
            action={this.changeActivity}
            isChecked={!this.props.store.timeMessage.messageActivity}
            theme={this.props.store.timeMessage.theme}
        />
    );

    changeActivity = () => {
        let chat = {
            ...this.props.store.chat,
            theme : this.props.store.timeMessage.theme
        };
        this.props.createTimeUsers(chat, this.props.store.timeMessage, !this.props.store.timeMessage.messageActivity);
    };


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
            <div className="graphich__second graphich__wrapper col-sm-12 col-md-10 col-lg-10 col-xl-11">
                {buttonsVisibility && this.createHeader("Time activity")}
                {buttonsVisibility && !this.props.store.chosen && this.activitySwitcher()}
                <div>
                    <LineChart data={this.props.store.timeMessage.data}
                               options={this.props.store.timeMessage.options}/>
                </div>
                <div className="wrapper flex-container btn btn__wrapper">
                        <div className="more-form container">
                            {buttonsVisibility &&
                            <div className="time-scale-radios row">
                                <div className="d-none d-lg-block col-lg-3 col-xl-3 scale-label">
                                    <label>Scale for:</label>
                                </div>
                                {this.createDayScaleRadios(dayScaleLabels)}
                            </div>
                            }
                            {dateRangeVisibility && this.createDateRange()}
                            {timeScaleVisibility &&
                            <div className="time-scale-radios row">
                                <div className="d-none d-lg-block col-lg-3 col-xl-3 scale-label">
                                    <label>Scale every:</label>
                                </div>
                                {this.createTimeScaleRadios(timeScaleLabels)}
                            </div>
                            }
                            <div className="average-wrapper row">
                                <div className="d-none d-lg-block average-item col-lg-3 col-xl-3"></div>
                                <div className="col-12 col-sm-12 col-md-12 col-lg-9 col-xl-9 row">
                                    {<div className="average-item col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4 CheckBox">
                                        {averageVisibility && this.createCheckbox('average', this.changeAverage, this.props.store.timeMessage.average)}
                                    </div>}
                                    {<div className={"average-item col-4 col-sm-4 col-md-4 col-xl-4 periods " + this.props.store.timeMessage.theme+"Periods"}>
                                        {periodsVisibility && this.createInput('periods', this.changePeriods, this.props.store.timeMessage.periods)}
                                    </div>}
                                    {<div className="average-item col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4 imposition CheckBox">
                                        {impositionVisibility && this.createCheckbox('imposition', this.changeImposition, this.props.store.timeMessage.imposition, "imposition-checkbox")}
                                    </div>}
                                </div>
                            </div>
                        </div>
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
        createTimeUsers : (chat, store, messageActivity) => {
            dispatch(createTimeUsers(chat, store, messageActivity))
        },
        setDataThirdGraphic: (time, dayScale, imposition, fromTime = null, toTime = null, customScale = null, average = false, periods = 1, messagesActivity = true, chosen = false, RAWTime = [], theme) => {
            dispatch(createTimeMessage(time, dayScale, imposition, fromTime, toTime, customScale, average, periods, messagesActivity, chosen, RAWTime, theme))
        }
    })
)(TimeMessageGraphic)