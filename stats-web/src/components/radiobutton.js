import React, { PureComponent } from 'react';

export default class RadioButton extends PureComponent {

    render() {
        return (
            <div className="radio">
                <label>
                    <input
                        type="radio"
                        id={this.props.data_id}
                        checked={this.props.checked}
                        onChange={this.props.onChange} />
                    {this.props.label}
                </label>
            </div>
        );
    };
}
