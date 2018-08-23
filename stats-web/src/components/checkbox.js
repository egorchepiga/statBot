import React, { Component} from 'react';

export default class Checkbox extends Component {
    render() {
        return (
            <div className="checkbox">
                <label>
                    <input
                        type="checkbox"
                        checked={this.props.checked}
                        onChange={this.props.onChange}
                    />
                    {this.props.label}
                </label>
            </div>
        );
    };
}
