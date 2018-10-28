import React, {Component} from 'react';
import {connect} from 'react-redux';
import '../styles/css/unauthorized.css';

class UnauthorizedScreen extends Component {

    createHeader = (label) => (
        <div className="header__most-active">
            <b>{label}</b>
        </div>
    );

    render() {
        return  (
            <div>
                <div className="unauthorized-header-container">
                    <label className="unauthorized-header">
                        {this.props.store.token.token === "deleted" ?
                            this.props.store.locale.deleted
                            : "Unauthorized 401"
                        }</label>
                    <div><a href="https://t.me/stats_tgbot">/report@stats_tgbot</a>
                        <label>
                            {this.props.store.locale.unauthorized.report}
                        </label>
                    </div>
                    <div><a href="https://t.me/stats_tgbot">/help</a>
                        <label>
                            {this.props.store.locale.unauthorized.help}
                        </label>
                    </div>
                    <a href="https://t.me/stats_tgbot">@stats_tgbot</a>
                </div>
                <div className="unauthorized ">
                    <img className="navalny" src="https://egorchepiga.ru/stats/navalny.png"/>
                    <img className="security" src="https://egorchepiga.ru/stats/security.png"/>
                    <img className="kick" src="https://egorchepiga.ru/stats/kick.png"/>
                </div>
            </div>
        )
    }
}

export default connect(state => ({
        store: state
    }), dispatch => ({
    })
)(UnauthorizedScreen)