import _ from 'underscore';
import Backbone from 'backbone';


export default class SidebarView extends Backbone.View {
    constructor(options) {
        options.tagName = 'ul';
        options.className = 'nav nav-sidebar';
        super(options);

        this._userTemplate = _.template(`
            <li class="user-link">
                <a href="/user/<%- slack_username %>">
                    <img class="avatar" src="<%- avatar %>" alt="">
                    <span class="name"><%- name %></span>
                </a>
            </li>
            `);

        this._ready = false;
        this._rendered = false;

        this.listenTo(this.model, 'route', this._onRoute);
        this.listenTo(this.model, 'ready', this._onReady);
    }

    events() {
        return {
            'click a': '_onClick'
        };
    }

    render() {
        if (this._ready) {
            const me = this.model.get('me');
            const allUsers = this.model.get('users');
            const groups = this.model.get('groups')
                .filter(group => group.get('show'));

            this.$el.empty();
            this.$el.append('<li class="active"><a href="/calendar">Calendar</a></li>');
            this.$el.append('<li><a href="/status">My Status Reports</a></li>');

            if (me.isAdmin()) {
                this.$el.append('<li><a href="/status/all">All Status Reports</a></li>');
            }

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
        } else {
            // TODO: placeholder?
        }

        this._rendered = true;

        return this;
    }

    _onClick(ev) {
        const path = $(ev.currentTarget).attr('href');

        if (path) {
            window.application.go(path.substr(1));
        }

        return false;
    }

    _onReady() {
        this._ready = true;
        if (this._rendered) {
            this.render();
        }

        this._onRoute();
    }

    _onRoute() {
        this.$('.active').removeClass('active');

        const path = document.location.pathname;
        this.$(`a[href='${path}']`).parent()
            .addClass('active');
    }
}
