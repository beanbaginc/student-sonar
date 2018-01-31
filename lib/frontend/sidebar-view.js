// jshint ignore: start

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, NavLink } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import ReadyView from './ready-view';


class SidebarItem extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    render() {
        const { to, icon, label } = this.props;

        return (
            <li className="nav-item">
                <NavLink
                    to={to} exact
                    className="nav-link"
                    activeClassName="active"
                    onClick={this.onClick}>
                    {icon && <img src={icon} className="sidebar-icon" />}
                    {label}
                </NavLink>
            </li>
        );
    }

    onClick(e) {
        // TODO: this can go away once we're entirely moved away from
        // Backbone.Router
        e.stopPropagation();
        e.preventDefault();

        const path = e.target.getAttribute('href');

        if (path) {
            window.application.go(path.substr(1));
        }
    }
}


export default class SidebarView extends ReadyView {
    constructor(options) {
        options = Object.create(options);
        super(options);

        this.history = createBrowserHistory();
        // TODO: This reflects any changes from Backbone.Router into the
        // react-router history. It's kind of a terrible thing, but it's
        // temporary. Get rid of it once we're moved away from Backbone.Router.
        this.model.on('route', () => this.history.replace(document.location.pathname));
    }

    _render() {
        const loggedIn = (window.userId !== null);
        const isMentor = (window.userType === 'mentor');

        let myStudentsItems = [];
        let groupsItems = null;

        if (isMentor) {
            const allUsers = this.model.get('users');
            const groups = this.model.get('groups')
                .filter(group => group.get('show'));

            groupsItems = groups.map(group => {
                const groupId = group.get('group_id');
                const users = allUsers.filter(user =>
                    user.get('type') === 'student' &&
                    user.get('groups').has(groupId));

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
                    <li key={group.get('id')}>
                        <div>{group.get('name')}</div>
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

        ReactDOM.render(
            <Router history={this.history}>
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
            </Router>,
            this.$el[0]);
    }
}
