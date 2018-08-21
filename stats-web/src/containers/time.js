import React, {Component} from 'react';
import {connect} from 'react-redux';
import LineChart from '../components/line';
import Button from '../components/button';
import Checkbox from '../components/checkbox';
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

class TimeMessageGraphic extends Component {

    setScale = (action) => {
        this.props.setDataThirdGraphic(this.props.store.timeMessage.RAWTime, action.target.id, this.props.store.timeMessage.brutal);
    };

    changeBrutal = () => {
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            this.props.store.timeMessage.scale,
            !this.props.store.timeMessage.brutal,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime
        );
    };

    createButton = (label, index) => (
        <Button key={index}
                id={index}
                label={label}
                onClick={this.setScale}
        />
    );

    setDate = (action) => {
        console.log(action);
        switch (action.id) {
            case 0:
                this.props.setDataThirdGraphic(
                    this.props.store.timeMessage.RAWTime,
                    this.props.store.timeMessage.scale,
                    this.props.store.timeMessage.brutal,
                    action.toDate()
                );
                break;
            default:
        }
    };


    createButtons = (buttonLabels) => (
        buttonLabels.map(this.createButton)
    );

    render() {
        return (
            <div>
                {this.createButtons(buttonLabels)}
                <Checkbox
                    label={'brutal'}
                    onChange={this.changeBrutal}/>
                <DateRange/>
                <LineChart data={this.props.store.timeMessage.data}
                            options={this.props.store.timeMessage.options}/>
            </div>
        );
    }
}

export default connect(
    state => ({
        store: state
    }),
    dispatch => ({
         setDataThirdGraphic: (time, scale, brutal, fromTime = null, toTime = null) => {
            dispatch(createTimeMessage(time, scale, brutal, fromTime, toTime))
        }
    })
)(TimeMessageGraphic)