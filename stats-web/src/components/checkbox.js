import React, { PureComponent } from 'react';

export default class Checkbox extends PureComponent {
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
