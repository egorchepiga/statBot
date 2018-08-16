import React,{Component} from 'react';
import {Doughnut} from 'react-chartjs-2';

export default class GraphicDoughnut extends Component {

    render() {
        if (this.props.data) return this.renderGraphic();
        return(<div></div>);
    }

    renderGraphic() {
        return (
            <div>
                <Doughnut data={this.props.data}
                          options={this.props.options}/>
            </div>
        )
    }
}