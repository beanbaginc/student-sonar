import _ from 'underscore';
import Backbone from 'backbone';

import ReadyView from './ready-view';


export default class SidebarView extends ReadyView {
    constructor(options) {
        options.tagName = 'ul';
        options.className = 'nav nav-sidebar';
        super(options);

        this._userTemplate = _.template(`
            <li class="user-link">
                <a href="/users/<%- slack_username %>">
                    <img class="avatar" src="<%- avatar %>" alt="">
                    <span class="name"><%- name %></span>
                </a>
            </li>
            `);

        this.listenTo(this.model, 'route', this._onRoute);
    }

    events() {
        return {
            'click a': '_onClick'
        };
    }

    _render() {
        const me = this.model.get('me');
        const admin = me.isAdmin();
        const allUsers = this.model.get('users');
        const groups = this.model.get('groups')
            .filter(group => group.get('show'));

        this.$el.empty();
        this.$el.append('<li><a href="/projects">Project Ideas</a></li>');
        this.$el.append('<li><a href="/calendar">Calendar</a></li>');
        this.$el.append('<li><a href="/status">My Status Reports</a></li>');

        if (admin) {
            this.$el.append('<li><a href="/status/all">All Status Reports</a></li>');

            groups.forEach(function(group) {
                const groupID = group.get('group_id');
                const users = allUsers.filter(user => user.get('groups').has(groupID));

                if (users.length === 0) {
                    return;
                }

                const $li = $('<li />')
                    .appendTo(this.$el);

                $('<div />')
                    .text(group.get('name'))
                    .appendTo($li);

                const $ul = $('<ul class="nav nav-sidebar" />')
                    .appendTo($li);

                users.forEach(user => $ul.append(this._userTemplate(user.attributes)));
            }, this);

            this.$el.append('<li><a href="/users">All Students</a></li>');

            this._onRoute();
        }
    }

    _onClick(ev) {
        const path = $(ev.currentTarget).attr('href');

        if (path) {
            window.application.go(path.substr(1));
        }

        return false;
    }

    _onRoute() {
        if (this._rendered) {
            this.$('.active').removeClass('active');

            const path = document.location.pathname;
            this.$(`a[href='${path}']`).parent()
                .addClass('active');
        }
    }
}
