import React,{Component} from 'react';
import {Bar} from 'react-chartjs-2';

export default class GraphicBar extends Component {
    render() {
        if (this.props.data) return this.renderGraphic();
        return(<div></div>);
    }

    renderGraphic() {
        return (
            <div>
                <Bar data={this.props.data}
                          options={this.props.options}/>
            </div>
        )
    }
}