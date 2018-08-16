import React,{Component} from 'react';
import {Line} from 'react-chartjs-2';

export default class LineChart extends Component {
    render() {
        if (this.props.data) return this.renderGraphic();
        return(<div></div>);
    }

    renderGraphic() {
        return (
            <div>
                <Line data={this.props.data}
                          options={this.props.options}/>
            </div>
        )
    }
}