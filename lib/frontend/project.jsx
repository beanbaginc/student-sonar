// jshint ignore: start

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';


class Project extends React.Component {
    render() {
        const user = (window.application.get('loggedIn') && this.props.assignee)
            ? this.props.users.items.find(user => user.email === this.props.assignee)
            : null;
        const userAvatar = user && user.avatar;

        // If an avatar exists. include it.
        let avatar = userAvatar
            ? <img src={userAvatar} className="assignee img-rounded" />
            : null;

        // If the logged in user can see user detail pages (mentors), wrap the
        // avatar in a link.
        if (avatar && window.userType === 'mentor') {
            avatar = (
                <Link to={`/users/${user.slack_username}`} className="user-avatar">
                    {avatar}
                </Link>
            );
        }

        const projects = this.props.projects
            .filter(project => project !== 'Student Projects')
            .map(project => <span key={project} className="label label-primary">{project}</span>);

        const tags = this.props.tags
            .map(tag => <span key={tag} className="label label-default">{tag}</span>);

        const content = { __html: this.props.children };

        return (
            <section id={`task-${this.props.id}`} className="student-project">
                <h3>{this.props.name}{avatar}</h3>
                {(tags || projects) && (
                    <div className="tags">
                        {projects}
                        {tags}
                    </div>
                )}
                <div dangerouslySetInnerHTML={content} />
            </section>
        );
    }
}


function mapStateToProps(state) {
    const { users } = state;

    return { users };
}


export default connect(mapStateToProps)(Project);
