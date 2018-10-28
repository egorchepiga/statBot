import React, {Component} from 'react';
import {connect} from 'react-redux';
import '../styles/css/empty.css';

class EmptyList extends Component {
    render() {
        return  (
            <div className="container">
                <div className="empty-report col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                    <label className="empty-report-header">{this.props.store.locale.empty}</label>
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
                    <a href="http://t.me/stats_tgbot">@stats_tgbot</a>
                </div>
            </div>
        )
    }
}

export default connect(state => ({
        store: state
    }), dispatch => ({
    })
)(EmptyList)