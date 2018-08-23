import React, { Component} from 'react';
import {connect} from 'react-redux';
import {createTimeMessage} from "../store/graphics/time/action";

class RadioButton extends Component {

    setScale = (action) => {
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            this.props.store.timeMessage.scale,
            this.props.store.timeMessage.imposition,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime,
            action.target.id,
            this.props.store.timeMessage.average,
            this.props.store.timeMessage.periods
        );
    };

    render() {
        return (
            <div className="radio">
                <label>
                    <input
                        type="radio"
                        id={this.props.data_id}
                        checked={this.props.data_id === this.props.store.timeMessage.timeScale}
                        onChange={this.setScale} />
                    {this.props.label}
                </label>
            </div>
        );
    };
}

export default connect(
    state => ({
        store: state
    }),
    dispatch => ({
        setDataThirdGraphic: (time, scale, brutal, fromTime, toTime, customScale, average, periods) => {
            dispatch(createTimeMessage(time, scale, brutal, fromTime, toTime, customScale, average, periods))
        }
    })
)(RadioButton)