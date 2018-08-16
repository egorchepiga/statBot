import React, {Component} from 'react';
import {connect} from 'react-redux';
import GraphicDoughnut from '../components/doughnut';

class SummaryGraphic extends Component {
    render() {
        return (
            <div>
                <GraphicDoughnut data={this.props.store.summaryGraphic.data}
                          options={this.props.store.summaryGraphic.options}/>
            </div>)
    }
}

export default connect(state => ({
        store: state
    }), dispatch => ({

    })
)(SummaryGraphic)