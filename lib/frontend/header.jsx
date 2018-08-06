// jshint ignore: start

import React from 'react';
import { connect } from 'react-redux';

import { setManage } from './redux/modules/manage';
import ToggleSwitch from './toggle-switch';


@connect(
    state => ({
        isMentor: state.userType === 'mentor',
        loggedIn: state.loggedIn,
    }),
    dispatch => ({
        onManageChanged: manage => dispatch(setManage(manage))
    })
)
export default class Header extends React.Component {
    render() {
        const { isMentor, loggedIn, onManageChanged } = this.props;

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
                                        onChange={onManageChanged}
                                    />
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
