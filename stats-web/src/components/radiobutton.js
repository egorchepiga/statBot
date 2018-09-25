import React, { PureComponent } from 'react';

export default class RadioButton extends PureComponent {

    render() {
        return (
            <div className={this.props.className ? this.props.className : ''}>
                <input type="radio"
                       name={this.props.data_id}
                       id={this.props.data_id}
                       checked={this.props.checked}
                       onChange={this.props.onChange}
                />
                <label htmlFor={this.props.data_id}>
                    {this.props.label}
                    </label>
            </div>
        );
    };
}