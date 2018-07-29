// jshint ignore: start

import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';


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


class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        props.model.on('ready', () => this.forceUpdate());
    }

    render() {
        const { groups, loggedIn, isMentor, model } = this.props;

        let myStudentsItems = [];
        let groupsItems = null;

        if (isMentor) {
            const allUsers = model.get('users');

            groupsItems = groups.items
                .filter(group => group.show)
                .map(group => {
                    const users = allUsers.filter(user =>
                        user.get('type') === 'student' &&
                        user.get('groups').has(group.group_id));

                    users.forEach(user => {
                        if (user.get('primary_mentor') === window.userId) {
                            myStudentsItems.push(
                                <SidebarItem
                                    key={user.get('id')}
                                    to={`/users/${user.get('slack_username')}`}
                                    icon={user.get('avatar')}
                                    label={user.get('name')}
                                />);
                        }
                    });

                return (
                    <li key={group.id}>
                        <div>{group.name}</div>
                        <ul className="nav nav-sidebar">
                            {users.map(user => (
                                <SidebarItem
                                    key={user.get('id')}
                                    to={`/users/${user.get('slack_username')}`}
                                    icon={user.get('avatar')}
                                    label={user.get('name')}
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


const mapStateToProps = state => ({
    groups: state.groups,
});

export default connect(mapStateToProps)(Sidebar);
