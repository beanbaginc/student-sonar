// jshint ignore: start

import React from 'react';
import { graphql } from 'react-apollo';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';

import { ALL_USERS_QUERY } from './api/user';


class RowView extends React.Component {
    render() {
        const { user } = this.props;

        return (
            <tr>
                <td className="avatars">
                    <Link to={`/users/${user.slack_username}`}>
                        {user.avatar ? (
                            <img src={user.avatar} className="img-rounded avatar-small" />
                        ) : (
                            <span className="fas fa-user avatar-small"></span>
                        )}
                        {user.name}
                    </Link>
                </td>
                <td>{user.school}</td>
                <td>{user.email}</td>
                <td>
                    <span className="tags">
                        {user.groups.map(group => <span key={group} className="label label-default">{group}</span>)}
                    </span>
                </td>
            </tr>
        );
    }
}


@graphql(ALL_USERS_QUERY)
export default class AllUsers extends React.Component {
    render() {
        const { data: { loading, error, users }} = this.props;

        let content;

        if (loading) {
            content = <tr><td colSpan="4"><span className="fas fa-sync fa-spin"></span></td></tr>;
        } else if (error) {
            content = <tr><td colSpan="4"><span className="fas fa-exclamation-triangle"></span> {error}</td></tr>;
        } else {
            content = users.map(user => <RowView key={user.id} user={user} />);
        }

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
                        <tbody>{content}</tbody>
                    </table>
                </div>
            </div>
        );
    }
}
