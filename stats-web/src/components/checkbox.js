import React, { PureComponent } from 'react';

export default class Checkbox extends PureComponent {
    render() {
        return (
            <div className={this.props.className ? this.props.className : ''}>
                <input type="checkbox"
                       name={this.props.label}
                       id={this.props.label}
                       checked={this.props.checked}
                       onChange={this.props.onChange}
                />
                <label htmlFor={this.props.label}>
                    {this.props.label}
                </label>
            </div>
        );
    };
}