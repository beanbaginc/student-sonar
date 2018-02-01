// jshint ignore: start

import React from 'react';
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


export default class Header extends React.Component {
    render() {
        const { isMentor, loggedIn, manage, onManageChanged } = this.props;

        return (
            <nav className="navbar navbar-default header">
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
            </nav>
        );
    }
}
