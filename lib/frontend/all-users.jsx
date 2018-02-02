// jshint ignore: start

import React from 'react';
import { NavLink } from 'react-router-dom';


class RowView extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }

    onClick(e) {
        // TODO: this can go away once we're entirely moved away from
        // Backbone.Router
        e.preventDefault();
        e.stopPropagation();

        const path = e.target.getAttribute('href');

        if (path) {
            window.application.go(path);
        }
    }

    render() {
        const user = this.props.user.attributes;
        const groups = [...(user.groups)].map(group =>
            <span key={group} className="label label-default">{group}</span>);

        return (
            <tr>
                <td>
                    <NavLink to={`/users/${user.slack_username}`} exact onClick={this.onClick}>
                        {user.avatar && <img src={user.avatar} className="img-rounded" width="24" height="24" />}
                        {user.name}
                    </NavLink>
                </td>
                <td>{user.school}</td>
                <td>{user.email}</td>
                <td><span className="tags">{groups}</span></td>
            </tr>
        );
    }
}


export default class AllUsers extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.props.model.on('ready', this.handleChange);
    }

    componentWillUnmount() {
        this.props.model.off('ready', this.handleChange);
    }

    handleChange() {
        this.forceUpdate();
    }

    render() {
        const users = this.props.model.get('users');

        return (
            <div className="all-users content-inner">
                <div className="panel panel-default">
                    <div className="panel-heading">All Users</div>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>School</th>
                                <th>E-mail Address</th>
                                <th>Groups</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => <RowView key={user.attributes.id} user={user} />)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
