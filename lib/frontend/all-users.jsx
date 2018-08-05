// jshint ignore: start

import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';


class RowView extends React.Component {
    render() {
        const { user } = this.props;
        const groups = user.groups || [];

        return (
            <tr>
                <td>
                    <Link to={`/users/${user.slack_username}`}>
                        {user.avatar && <img src={user.avatar} className="img-rounded" width="24" height="24" />}
                        {user.name}
                    </Link>
                </td>
                <td>{user.school}</td>
                <td>{user.email}</td>
                <td>
                    <span className="tags">
                        {groups.map(group => <span key={group} className="label label-default">{group}</span>)}
                    </span>
                </td>
            </tr>
        );
    }
}


@connect(state => ({
    users: state.users,
}))
export default class AllUsers extends React.Component {
    render() {
        const { users } = this.props;

        return (
            <div className="all-users content-inner">
                <Helmet>
                    <title>All Users - Student Sonar</title>
                </Helmet>
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
                            {users.items.map(user => <RowView key={user._id} user={user} />)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
