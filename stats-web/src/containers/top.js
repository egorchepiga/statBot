import React, {Component} from 'react';
import {connect} from 'react-redux';
import GraphicBar from '../components/bar';

class TopGraphic extends Component {
    render() {
        return (
            <div>
                <GraphicBar data={this.props.store.topWordsForChat.data}
                                 options={this.props.store.topWordsForChat.options}/>
            </div>)
    }
}

export default connect(state => ({
        store: state
    }), dispatch => ({

    })
)(TopGraphic)