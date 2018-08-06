// jshint ignore: start

import React from 'react';
import { graphql } from 'react-apollo';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';

import { ACTIVE_GROUPS_QUERY } from './api/group';


class SidebarItem extends React.Component {
    render() {
        const { to, icon, label } = this.props;

        return (
            <li className="nav-item">
                <NavLink
                    to={to} exact
                    className="nav-link"
                    activeClassName="active"
                >
                    {icon && <img src={icon} className="sidebar-icon" />}
                    {label}
                </NavLink>
            </li>
        );
    }
}


@graphql(ACTIVE_GROUPS_QUERY)
class GroupsItems extends React.Component {
    render() {
        const { data: { loading, error, groups }} = this.props;

        if (loading) {
            return <li><div><span className="fas fa-sync fa-spin"></span></div></li>;
        } else if (error) {
            return <li><div><span className="fas fa-exclamation-triangle"></span> {error}</div></li>;
        } else {
            const myStudentsIds = new Set();
            const myStudents = [];

            groups.forEach(group => {
                group.users.forEach(user => {
                    if (user.primary_mentor === window.userId &&
                        !myStudentsIds.has(user.id)) {
                        myStudentsIds.add(user.id);
                        myStudents.push(user);
                    }
                });
            });

            const myStudentsItems = [(
                <li key="my-students">
                    <div>My Students</div>
                    <ul className="nav nav-sidebar">
                        {myStudents
                            .sort((a, b) => a.name.localeCompare(b))
                            .map(user => (
                                <SidebarItem
                                    key={user.id}
                                    to={`/users/${user.slack_username}`}
                                    icon={user.avatar}
                                    label={user.name}
                                />
                            ))
                        }
                    </ul>
                </li>
            )];
            const groupsItems = groups.map(group => (
                <li key={group.id}>
                    <div>{group.name}</div>
                    <ul className="nav nav-sidebar">
                        {group.users.map(user => (
                            <SidebarItem
                                key={user.id}
                                to={`/users/${user.slack_username}`}
                                icon={user.avatar}
                                label={user.name}
                            />
                        ))}
                    </ul>
                </li>
            ));

            return myStudentsItems.concat(groupsItems);
        }
    }
}


@withRouter
@connect(state => ({
    isMentor: state.userType === 'mentor',
    loggedIn: state.loggedIn,
}))
export default class Sidebar extends React.Component {
    render() {
        const { loggedIn, isMentor } = this.props;

        return (
            <div className="sidebar">
                <ul className="nav nav-sidebar">
                    <SidebarItem to="/projects" label="Project Ideas" />
                    {loggedIn && <SidebarItem to="/calendar" label="Calendar" />}
                    {loggedIn && <SidebarItem to="/status" label="My Status Reports" />}
                    {isMentor && <SidebarItem to="/status/all" label="All Status Reports" />}
                    {isMentor && <GroupsItems />}
                    {isMentor && <SidebarItem to="/users" label="All Users" />}
                </ul>
            </div>
        );
    }
}
