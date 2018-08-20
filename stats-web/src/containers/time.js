import React, {Component} from 'react';
import {connect} from 'react-redux';
import LineChart from '../components/line';
import {createTimeMessage} from '../store/graphics/time/action';

class TimeMessageGraphic extends Component {

    setScale = (action) => {
        this.props.setDataThirdGraphic(this.props.store.timeMessage.RAWTime, action.target.id);
    };

    render() {
        return (
            <div>
                <button id={0} onClick={this.setScale}> all time  </button>
                <button id={1} onClick={this.setScale}> today </button>
                <button id={2} onClick={this.setScale}> 3 days </button>
                <button id={3} onClick={this.setScale}> week </button>
                <button id={4} onClick={this.setScale}> month </button>
                <button id={5} onClick={this.setScale}> custom </button>
                <button id={5} onClick={this.setScale}> custom </button>
                <LineChart data={this.props.store.timeMessage.data}
                            options={this.props.store.timeMessage.options}/>
            </div>)
    }
}

export default connect(
    state => ({
        store: state
    }),
    dispatch => ({
         setDataThirdGraphic: (time, scale) => {
            dispatch(createTimeMessage(time, scale))
        }
    })
)(TimeMessageGraphic)