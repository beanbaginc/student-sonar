// jshint ignore: start

import React from 'react';
import { connect } from 'react-redux';

import { setManage } from './redux/modules/manage';
import ToggleSwitch from './toggle-switch';


const mapStateToProps = state => ({ manage: state.manage });
const mapDispatchToProps = (dispatch, props) => ({
    onChange: manage => dispatch(setManage(manage)),
});
const ManageSwitch = connect(mapStateToProps, mapDispatchToProps)(ToggleSwitch);


const Header = ({ dispatch, isMentor, loggedIn, manage }) => (
    <nav className="navbar navbar-default header">
        <div className="container-fluid">
            <a className="navbar-brand" id="root-link" href="/">Student Sonar</a>

            <div className="collapse navbar-collapse navbar-right">
                <ul className="nav navbar-nav">
                    {isMentor && (
                        <li><ManageSwitch label="Manage" /></li>
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


export default Header;
