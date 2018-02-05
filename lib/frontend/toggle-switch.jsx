// jshint ignore: start

import React from 'react';
import 'bootstrap-toggle';


export default class ToggleSwitch extends React.Component {
    componentDidMount() {
        this._$el
            .bootstrapToggle()
            .change(e => {
                e.stopPropagation();
                e.preventDefault();

                this.props.onChange(e.target.checked);
            });
    }

    render() {
        return <input
            type="checkbox"
            data-size="small"
            data-on={this.props.label}
            data-off={this.props.label}
            ref={el => this._$el = el ? $(el) : null}
        />
    }
}

