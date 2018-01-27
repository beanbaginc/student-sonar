// jshint ignore: start

import React from 'react';


export default class Project extends React.Component {
    constructor(props) {
        super(props);
        this._onUserClicked = this._onUserClicked.bind(this);
    }

    _onUserClicked(e) {
        e.stopPropagation();
        e.preventDefault();

        const path = e.currentTarget.getAttribute('href');

        if (path) {
            window.application.go('path');
        }
    }

    render() {
        const user = (window.application.get('loggedIn') && this.props.assignee)
            ? window.application.get('users').findWhere({email: this.props.assignee})
            : null;
        const userAvatar = user && user.get('avatar');
        const canSeeUsers = (window.userType === 'mentor' ||
                             window.userType === 'instructor');
        const userLink = (user && canSeeUsers) ? `/users/${user.get('slack_username')}` : null;

        // If an avatar exists. include it.
        let avatar = userAvatar
            ? <img src={userAvatar} className="assignee img-rounded" />
            : null;

        // If the logged in user can see user detail pages (mentors), wrap the
        // avatar in a link.
        avatar = (avatar && userLink)
            ? <a href={userLink} className="user-avatar" onClick={this._onUserClicked}>{avatar}</a>
            : avatar;

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
