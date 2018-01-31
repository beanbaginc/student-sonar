// jshint ignore: start

import React from 'react';
import ReactDOM from 'react-dom';
import Backbone from 'backbone';
import 'bootstrap-toggle';


class ToggleSwitch extends React.Component {
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


class Header extends React.Component {
    render() {
        const { isMentor, loggedIn, manage, onManageChanged } = this.props;

        return (
            <div className="container-fluid">
                <a className="navbar-brand" id="root-link" href="/">Student Sonar</a>

                <div className="collapse navbar-collapse navbar-right">
                    <ul className="nav navbar-nav">
                        {isMentor && (
                            <li>
                                <ToggleSwitch
                                    label="Manage"
                                    checked={manage}
                                    onChange={onManageChanged} />
                            </li>
                        )}

                        {loggedIn ? (
                            <li><a href="/logout">Log out</a></li>
                        ) : (
                            <li><a href="/login">Log in</a></li>
                        )}
                    </ul>
                </div>
            </div>
        );
    }
}

/*
 * HeaderView wraps the site header containing various navigation links.
 */
export default class HeaderView extends Backbone.View {
    constructor(options) {
        options = Object.create(options);
        options.tagName = 'nav';
        options.className = 'navbar navbar-default navbar-fixed-top';
        super(options);
    }

    render() {
        const loggedIn = (window.userId !== null);
        const isMentor = (window.userType === 'mentor');

        ReactDOM.render(
            <Header
                loggedIn={loggedIn}
                isMentor={isMentor}
                manage={this.model.get('manage')}
                onManageChanged={manage => this.model.set({ manage })}
            />,
            this.el);

        return this;
    }
}
