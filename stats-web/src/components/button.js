import React, {PureComponent} from 'react';

export default class Button extends PureComponent {

    render() {
        let className = this.props.className;
        className += this.props.active ? ' active ' : '';
        return (
            <button className={className} id={this.props.id} onClick={this.props.onClick}>
                {this.props.label}
            </button>
        );
    }
}

