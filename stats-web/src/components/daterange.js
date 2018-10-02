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
            <div className={"datepicker row " + this.props.store.timeMessage.theme+"Datepicker"}>
                <div className="datepicker-label-from col-1 col-sm-1 col-md-1 col-lg-3 col-xl-3">
                    <label>{this.props.store.locale.time.buttons.datepicker.from}</label>
                </div>
                <div className="datepicker-item datepicker-from col-3 col-sm-3 col-md-3 col-lg-3 col-xl-3">
                    <DatePicker
                        selected={this.state.startDate}
                        selectsStart
                        startDate={this.state.startDate}
                        endDate={this.state.endDate}
                        onChange={this.handleChangeStart}
                    />
                </div>
                <div className="datepicker-item col-5 col-sm-5 col-md-5 col-lg-6 col-xl-6 datepicker-to">
                    <label>{this.props.store.locale.time.buttons.datepicker.to}</label>
                    <DatePicker
                        selected={this.state.endDate}
                        selectsEnd
                        startDate={this.state.startDate}
                        endDate={this.state.endDate}
                        onChange={this.handleChangeEnd}
                    />
                </div>
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