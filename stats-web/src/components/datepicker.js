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
            endDate: moment(),
            wasClicked : false
        }
    }

    handleChange = ({startDate, endDate}) => {
        startDate = moment(startDate || this.state.startDate);
        endDate = endDate || this.state.endDate;
        if (startDate.isAfter(endDate)) {
            endDate = startDate
        }

        let timeScale = this.props.store.timeMessage.timeScale;
        if(!this.state.wasClicked) timeScale = calculateTimeScale(startDate);

        let wasClicked = true;

        this.setState({startDate, endDate, wasClicked});
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            this.props.store.timeMessage.scale,
            this.props.store.timeMessage.imposition,
            startDate.toDate(),
            endDate.toDate(),
            timeScale,
            this.props.store.timeMessage.average,
            this.props.store.timeMessage.periods
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
    };
}

let calculateTimeScale = (day) => {
    let timeFromShow = new Date();
    timeFromShow.setMinutes(0);
    timeFromShow.setSeconds(0);
    let timeToShow = new Date(day);
    let timeScale,
        diffDays = Math.ceil((timeFromShow - timeToShow) / (1000 * 3600 * 24));
    if (diffDays <= 1) timeScale = '0';
    else if (diffDays <= 3) timeScale = '1';
    else if (diffDays <= 7) timeScale = '2';
    else if (diffDays > 7) timeScale = '2';
    return timeScale;
}

export default connect(
    state => ({
        store: state
    }),
    dispatch => ({
        setDataThirdGraphic: (time, scale, brutal, fromTime, toTime, timeScale) => {
            dispatch(createTimeMessage(time, scale, brutal, fromTime, toTime, timeScale))
        }
    })
)(DateRange)