import React, { Component} from 'react';
import {connect} from 'react-redux';
import {createTimeMessage} from "../store/graphics/time/action";

class RadioButton extends Component {

    setScale = (action) => {
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            this.props.store.timeMessage.scale,
            this.props.store.timeMessage.brutal,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime,
            action.target.id
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
        setDataThirdGraphic: (time, scale, brutal, fromTime, toTime, customScale) => {
            dispatch(createTimeMessage(time, scale, brutal, fromTime, toTime, customScale))
        }
    })
)(RadioButton)