import React, {PureComponent} from 'react';

export default class Button extends PureComponent {

    render() {
        return (
            <button id={this.props.id} onClick={this.props.onClick}>
                {this.props.label}
            </button>
        );
    }
}

