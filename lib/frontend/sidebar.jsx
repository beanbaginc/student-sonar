// jshint ignore: start

import React from 'react';
import { connect } from 'react-redux';
import { NavLink, withRouter } from 'react-router-dom';


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


@withRouter
@connect(state => ({
    groups: state.groups,
    users: state.users,
}))
export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { groups, loggedIn, isMentor, users } = this.props;

        let myStudentsItems = [];
        let groupsItems = null;

        if (isMentor) {
            groupsItems = groups.items
                .filter(group => group.show)
                .map(group => {
                    const groupUsers = users.items.filter(user =>
                        user.type === 'student' &&
                        user.groups.includes(group.group_id));

                    groupUsers.forEach(user => {
                        if (user.primary_mentor === window.userId) {
                            myStudentsItems.push(
                                <SidebarItem
                                    key={user._id}
                                    to={`/users/${user.slack_username}`}
                                    icon={user.avatar}
                                    label={user.name}
                                />);
                        }
                    });

                return (
                    <li key={group._id}>
                        <div>{group.name}</div>
                        <ul className="nav nav-sidebar">
                            {groupUsers.map(user => (
                                <SidebarItem
                                    key={user._id}
                                    to={`/users/${user.slack_username}`}
                                    icon={user.avatar}
                                    label={user.name}
                                />
                            ))}
                        </ul>
                    </li>
                );
            });
        }

        return (
            <div className="sidebar">
                <ul className="nav nav-sidebar">
                    <SidebarItem to="/projects" label="Project Ideas" />
                    {loggedIn && <SidebarItem to="/calendar" label="Calendar" />}
                    {loggedIn && <SidebarItem to="/status" label="My Status Reports" />}
                    {isMentor && <SidebarItem to="/status/all" label="All Status Reports" />}
                    {isMentor && (
                        <li>
                            <div>My Students</div>
                            <ul className="nav nav-sidebar">
                                {myStudentsItems}
                            </ul>
                        </li>
                    )}
                    {groupsItems}
                    {isMentor && <SidebarItem to="/users" label="All Users" />}
                </ul>
            </div>
        );
    }
}
