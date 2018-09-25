import React, {PureComponent} from 'react';

export default class Button extends PureComponent {

    render() {

        let className = this.props.className;
        className += this.props.active ? ' active ' : '';
        return (
            <button className={className + " " + (this.props.theme || "")} id={this.props.id} onClick={this.props.onClick} style={this.props.style || {}}>
                {this.props.label}
            </button>
        );
    }
}

