// jshint ignore: start

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';


@connect(state => ({
    loggedIn: state.loggedIn,
    users: state.users.items,
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
            projects,
            tags,
            users,
            userType,
        } = this.props;
        const user = (loggedIn && assignee)
            ? users.find(user => user.email === assignee)
            : null;
        const userAvatar = user && user.avatar;

        // If an avatar exists. include it.
        let avatar = userAvatar
            ? <img src={userAvatar} className="assignee img-rounded" />
            : null;

        // If the logged in user can see user detail pages (mentors), wrap the
        // avatar in a link.
        if (avatar && userType === 'mentor') {
            avatar = (
                <Link to={`/users/${user.slack_username}`} className="user-avatar">
                    {avatar}
                </Link>
            );
        }

        const projectItems = projects
            .filter(project => project !== 'Student Projects')
            .map(project => <span key={project} className="label label-primary">{project}</span>);

        const tagItems = tags
            .map(tag => <span key={tag} className="label label-default">{tag}</span>);

        const content = { __html: children };

        return (
            <section id={`task-${id}`} className="student-project">
                <h3>{name}{avatar}</h3>
                {(tagItems || projectItems) && (
                    <div className="tags">
                        {projectItems}
                        {tagItems}
                    </div>
                )}
                <div dangerouslySetInnerHTML={content} />
            </section>
        );
    }
}
