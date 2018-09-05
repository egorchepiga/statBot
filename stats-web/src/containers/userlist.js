import React, {Component} from 'react';
import {connect} from 'react-redux';

class UserList extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
    }

    render() {
        return (
            <div>
            </div>)
    }
}



export default connect(state => ({
        store: state
    }), dispatch => ({
    });
)(UserList)