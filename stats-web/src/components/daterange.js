import React,{Component} from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import {connect} from 'react-redux';
import {createTimeMessage} from "../store/graphics/time/action";
import {calculateTimeScale} from "../common/timeHelpers";


class DateRange extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: moment(),
            endDate: moment(),
            wasClicked : false
        }
    }
    handleChangeStart = (startDate) => this.handleChange({startDate});
    handleChangeEnd = (endDate) => this.handleChange({endDate});

    handleChange = ({startDate, endDate}) => {
        startDate = moment(startDate || this.state.startDate);
        endDate = endDate || this.state.endDate;
        if (startDate.isAfter(endDate))
            endDate = startDate;
        let wasClicked = true;
        this.setState({startDate, endDate, wasClicked});

        let timeScale = !this.state.wasClicked ? calculateTimeScale(startDate) : this.props.store.timeMessage.timeScale;
        this.props.setDataThirdGraphic(
            this.props.store.timeMessage.RAWTime,
            this.props.store.timeMessage.dayScale,
            this.props.store.timeMessage.imposition,
            startDate.toDate(),
            endDate.toDate(),
            timeScale,
            this.props.store.timeMessage.average,
            this.props.store.timeMessage.periods
        );
    };

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

export default connect(
    state => ({
        store: state
    }),
    dispatch => ({
        setDataThirdGraphic: (time, dayScale, imposition, fromTime, toTime, timeScale, average, periods) => {
            dispatch(createTimeMessage(time, dayScale, imposition, fromTime, toTime, timeScale, average, periods))
        }
    })
)(DateRange)