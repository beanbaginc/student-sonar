// jshint ignore: start

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';


@connect(state => ({
    loggedIn: state.loggedIn,
    userType: state.userType,
}))
export default class Project extends React.Component {
    render() {
        const {
            assignee,
            children,
            id,
            loggedIn,
            name,
            tags,
            user,
            userType,
        } = this.props;
        const userAvatar = user && user.avatar;

        // If an avatar exists. include it.
        let avatar = userAvatar
            ? <img src={userAvatar} className="assignee img-rounded" />
            : null;

        // If the logged in user can see user detail pages (mentors), wrap the
        // avatar in a link.
        if (avatar && userType === 'mentor') {
            avatar = (
                <Link to={`/users/${user.slackUsername}`} className="user-avatar">
                    {avatar}
                </Link>
            );
        }

        const tagItems = tags
            .map(tag => <span key={tag} className="label label-default">{tag}</span>);

        const content = { __html: children };

        return (
            <section id={`task-${id}`} className="student-project">
                <h3>{name}{avatar}</h3>
                {tagItems && <div className="tags">{tagItems}</div>}
                <div dangerouslySetInnerHTML={content} />
            </section>
        );
    }
}
