// jshint ignore: start

import PropTypes from 'prop-types';
import React from 'react';


export default class Editable extends React.Component {
    constructor(props) {
        super(props);
        this.editable = null;
    }

    componentDidMount() {
        const options = Object.assign({
            success: (rsp, value) => this.props.onChange(value),
        }, this.props.options);

        this.$el
            .editable(options)
            .on('shown', this.props.onShow)
            .on('hidden', this.props.onHide)
            .on('init', this.props.onInit);
    }

    componentWillUnmount() {
        this.$el.editable('destroy');
    }

    componentDidUpdate(prevProps) {
        if (prevProps.options.disabled !== this.props.options.disabled) {
            this.$el.editable(this.props.options.disabled
                ? 'disable'
                : 'enable');
        }

        if (prevProps.options.value !== this.props.options.value) {
            this.$el.editable('setValue', this.props.options.value);
        }
    }

    render() {
        return (
            <span
                ref={el => this.$el = el ? $(el) : $()}>
                {this.props.children}
            </span>
        );
    }
}


Editable.propTypes = {
    children: PropTypes.node,
    onChange: PropTypes.func,
    onHide: PropTypes.func,
    onShow: PropTypes.func,
    options: PropTypes.object,
};
