// jshint ignore: start

import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';


class RowView extends React.Component {
    render() {
        const user = this.props.user.attributes;
        const groups = [...(user.groups)].map(group =>
            <span key={group} className="label label-default">{group}</span>);

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
                            {users.map(user => <RowView key={user.attributes.id} user={user} />)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
