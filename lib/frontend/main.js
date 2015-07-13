import $ from 'jquery';
import Backbone from 'backbone';

import IndexView from './index-view';
import UserDetailView from './user-detail-view';
import * as models from './models';


$(function() {
    // Basic data and routes
    const $content = $('#content');
    const calendarItems = new models.CalendarItemCollection();
    const groups = new models.GroupCollection();
    const users = new models.UserCollection();

    const router = new Backbone.Router({
        routes: {
            'admin': 'admin',
            'user/:username': 'user',
            '': 'root'
        }
    });


    // Admin view
    router.on('route:admin', function() {
        // TODO: show admin view
    });


    // User detail view
    const userViews = {};

    router.on('route:user', function(username) {
        const attach = function(view) {
            $content
                .children().detach().end()
                .append(view.el);
        };

        if (userViews.hasOwnProperty(username)) {
            attach(userViews[username]);
        } else {
            const create = function() {
                const user = users.find(user => user.get('slack_username') === username);
                if (user) {
                    const view = new UserDetailView({
                        model: user
                    });
                    userViews[username] = view;
                    attach(view);

                    view.render();
                } else {
                    console.log('Could not find User object for %s', username);
                }
            };

            if (users.length === 0) {
                users.fetch({
                    success: create
                });
            } else {
                create();
            }
        }
    });


    // Index view
    const indexView = new IndexView({
        model: new Backbone.Model({
            calendar: calendarItems,
            groups: groups,
            users: users
        })
    });

    router.on('route:root', function() {
        $content
            .children().detach().end()
            .append(indexView.render().el);
    });

    indexView.on('activate-user', function(user) {
        router.navigate(`user/${user.attributes.slack_username}`,
                        { trigger: true });
    });


    // Application start
    Backbone.history.start({
        pushState: true
    });

    calendarItems.fetch();
    groups.fetch();
    users.fetch();
});


export default {};
