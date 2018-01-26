import _ from 'underscore';
import Backbone from 'backbone';

import ReadyView from './ready-view';


export default class TaskView extends Backbone.View {
    constructor(options) {
        options = Object.create(options);
        options.tagName = 'section';
        options.className = 'student-project';
        options.events = {
            'click .user-avatar': '_onUserClicked'
        };

        super(options);

        this._template = _.template(`
            <h3>
                <%- task.name %>
                <% if (user) { %>
                    <% if (userLink) { %><a href="/users/<%- user.get('slack_username') %>" class="user-avatar"><% } %>
                        <img src="<%- user.get('avatar') %>" class="assignee img-rounded">
                    <% if (userLink) { %></a><% } %>
                <% } %>
            </h3>

            <% if (task.tags || task.projects) { %>
                <div class="tags">
                    <% task.projects.forEach(function(projectName) { %>
                        <% if (projectName !== 'Student Projects') { %>
                            <span class="label label-primary"><%- projectName %></span>
                        <% } %>
                    <% }) %>

                    <% task.tags.forEach(function(tag) { %>
                        <span class="label label-default"><%- tag %></span>
                    <% }) %>
                </div>
            <% } %>

            <%= task.html %>
            `);
    }

    render() {
        const email = this.model.get('assignee_email');

        const user = (window.application.get('loggedIn') && email)
                   ? window.application.get('users').findWhere({email: email})
                   : null;
        const canSeeUsers = (window.userType === 'mentor' ||
                             window.userType === 'instructor');

        this.$el
            .empty()
            .attr('id', `task-${this.model.get('id')}`)
            .html(this._template({
                task: this.model.attributes,
                user: user,
                userLink: user && canSeeUsers
            }));

        return this;
    }

    _onUserClicked(ev) {
        const path = $(ev.currentTarget).attr('href');

        if (path) {
            window.application.go(path.substr(1));
        }

        return false;
    }
}
