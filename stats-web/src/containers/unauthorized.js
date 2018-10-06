import React, {Component} from 'react';
import {connect} from 'react-redux';

class UnauthorizedScreen extends Component {

    createHeader = (label) => (
        <div className="header__most-active">
            <b>{label}</b>
        </div>
    );

    render() {
        let visibility = this.props.store.token.token === 'unauthorized';
        return visibility && (
            <div className="unauthorized col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                <div className="unauthorized-header col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                    <label>Unauthorized 401</label>
                </div>
                <img className="navalny" src="https://egorchepiga.ru/navalny.png"/>
                <img className="security" src="https://egorchepiga.ru/security.png"/>
            </div>)
    }
}

export default connect(state => ({
        store: state
    }), dispatch => ({
    })
)(UnauthorizedScreen)