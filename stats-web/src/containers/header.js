import React, {Component} from 'react';
import {connect} from 'react-redux';
import Init from '../components/initComponents';
import {setToken} from '../store/getStats/token/action'

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
}

export default connect(state => ({
        store: state
    }), dispatch => ({
        setToken: (token) => {
            dispatch(setToken(token));
        },
        get: ({id, token, fromTime, toTime}) => {
            dispatch(getAll({id, token, fromTime, toTime}));
        }
    })
)(Header)