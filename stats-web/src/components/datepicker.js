import React,{Component} from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import {connect} from 'react-redux';
import {createTimeMessage} from "../store/graphics/time/action";


class DateRange extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: moment(),
            endDate: moment()
        }
    }

    handleChange = ({startDate, endDate}) => {
        startDate = moment(startDate || this.state.startDate);
        endDate = endDate || this.state.endDate;

        if (startDate.isAfter(endDate)) {
            endDate = startDate
        }
        this.setState({startDate, endDate});
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            this.props.store.timeMessage.scale,
            this.props.store.timeMessage.brutal,
            startDate.toDate(),
            endDate.toDate()
        );
    };

    handleChangeStart = (startDate) => this.handleChange({startDate})

    handleChangeEnd = (endDate) => this.handleChange({endDate})

    render() {
        return (
            <div className="row">
                <DatePicker
                    selected={this.state.startDate}
                    selectsStart
                    startDate={this.state.startDate}
                    endDate={this.state.endDate}
                    onChange={this.handleChangeStart}
                />
                <DatePicker
                    selected={this.state.endDate}
                    selectsEnd
                    startDate={this.state.startDate}
                    endDate={this.state.endDate}
                    onChange={this.handleChangeEnd}
                />
            </div>
        )
    }
}

export default connect(
    state => ({
        store: state
    }),
    dispatch => ({
        setDataThirdGraphic: (time, scale, brutal, fromTime, toTime) => {
            dispatch(createTimeMessage(time, scale, brutal, fromTime, toTime))
        }
    })
)(DateRange)