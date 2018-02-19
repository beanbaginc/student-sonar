// jshint ignore: start

import React from 'react';
import { connect } from 'react-redux';

import { setManage } from './redux/modules/manage';
import ToggleSwitch from './toggle-switch';


const Header = ({ dispatch, isMentor, loggedIn, manage }) => (
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
                                onChange={manage => dispatch(setManage(manage))} />
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


function mapStateToProps(state) {
    return { manage: state.manage };
}


export default connect(mapStateToProps)(Header);
