import React, {Component} from 'react';
import {connect} from 'react-redux';
import GraphicBar from '../components/bar';

class TopGraphic extends Component {

    createHeader = (label) => (
        <div className="header__most-active">
            <b>{label}</b>
        </div>
    );

    render() {
        let visibility = this.props.store.topWordsForChat.data;
        return (
            <div className="graphich__second graphich__wrapper col-sm-12 col-md-10 col-lg-9 col-xl-7">
                <div className="chartjs-size-monitor"
                     /*style={{position: 'absolute', left: '0px', top: '0px', right: '0px',
                     bottom: '0px', overflow: 'hidden', 'pointer-events': 'none',
                     visibility: 'hidden', 'z-index': -1}}*/>
                    {visibility && this.createHeader('Top words')}
                    <GraphicBar data={this.props.store.topWordsForChat.data}
                                 options={this.props.store.topWordsForChat.options}/>
                </div>
            </div>)
    }
}

export default connect(state => ({
        store: state
    }), dispatch => ({

    })
)(TopGraphic)