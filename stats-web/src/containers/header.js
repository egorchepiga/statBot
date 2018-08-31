import React, {Component} from 'react';
import {connect} from 'react-redux';
import Init from '../components/initComponents';
import {getAll} from '../services/stats';
import {setToken} from '../store/getStats/token/action'
import {setUserId} from '../store/getStats/user/action'
import {setFromTime, setToTime} from '../store/getStats/timeFrame/action'


class Header extends Component {

    constructor(props){
        super(props);
        let token = new URL(window.location).searchParams.get("token");
        this.props.setToken(token);
    }

    componentWillMount(){
    }

    render() {
        return (
            <div>
                <Init
                    token={this.props.store.token}
                    getStats={this.getStats}
                />
            </div>)
    }

    getStats = () => {
        this.props.get({id: this.props.store.user.id, token: this.props.store.token, fromTime: this.props.store.timeFrame.fromTime, toTime: this.props.store.timeFrame.toTime});
    };
    userClick = (event) => {
        this.props.setUser({id: event.target.value});
    };
    tokenClick = (event) => {
        this.props.setToken(event.target.value);
    };
    fromTimeClick = (event) => {
        this.props.setFromTime(event.target.value);
    };
    toTimeClick = (event) => {
        this.props.setToTime(event.target.value);
    };
}

export default connect(state => ({
        store: state
    }), dispatch => ({
        setToken: (token) => {
            dispatch(setToken(token));
        },
        setUser: ({id}) => {
            dispatch(setUserId(id));
        },
        setFromTime: (fromTime) => {
            dispatch(setFromTime(fromTime));
        },
        setUser: (toTime) => {
            dispatch(setToTime(toTime));
        },
        get: ({id, token, fromTime, toTime}) => {
            dispatch(getAll({id, token, fromTime, toTime}));
        }
    })
)(Header)