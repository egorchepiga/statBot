import React, { PureComponent } from 'react';

export default class Input extends PureComponent {
    render() {
        return (
            <div>
                <input
                    className={this.props.className ? this.props.className : ''}
                    type="number"
                    value={this.props.value}
                    onChange={this.props.onChange}
                />
                <label>
                    {this.props.label}
                </label>
            </div>
        );
    };
}
