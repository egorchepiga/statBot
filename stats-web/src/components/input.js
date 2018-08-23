import React, { Component} from 'react';

export default class Input extends Component {
    render() {
        return (
            <div className="checkbox">
                <label>
                    <input
                        type="number"
                        value={this.props.value}
                        onChange={this.props.onChange}
                    />
                    {this.props.label}
                </label>
            </div>
        );
    };
}
