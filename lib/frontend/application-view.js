import _ from 'underscore';
import Backbone from 'backbone';

import CalendarView from './calendar-view';
import FilteredCollection from './filtered-collection';
import HeaderView from './header-view';
import SidebarView from './sidebar-view';
import StatusReportCheckerView from './status-report-checker-view';
import UserDetailView from './user-detail-view';


/*
 * ApplicationView is a view that wraps the entire application. It shows a
 * header, and then shows different sub-views for each page.
 */
export default class ApplicationView extends Backbone.View {
    constructor(options) {
        super(options);

        this._template = `
            <div class="container-fluid content">
                <div class="col-lg-2 sidebar">
                </div>
                <div class="col-lg-offset-2 main">
                    <div id="spinner"><span class="fa fa-refresh fa-spin"></span></div>
                </div>
            </div>
            `;

        this._headerView = new HeaderView({ model: this.model });
        this._calendarView = new CalendarView({ model: this.model });
        this._sidebarView = new SidebarView({ model: this.model });
        this._statusReportView = new StatusReportCheckerView({ model: this.model });
        this._userDetailViews = {};

        this._ready = false;

        this.listenTo(this.model, 'ready', this._onReady);

        this.listenTo(this.model, 'route:calendar', function() {
            this._attachContent(this._calendarView.render());
        });

        this.listenTo(this.model, 'route:status', function() {
            this._attachContent(this._statusReportView.render());
        });

        this.listenTo(this.model, 'route:root', function() {
            // TODO: some kind of root/intro page
        });

        this.listenTo(this.model, 'route:user', this._onRouteUser);
    }

    render() {
        this.$el
            .append(this._headerView.render().el)
            .append(this._template);

        this._$sidebar = this.$('.sidebar')
            .append(this._sidebarView.render().el);
        this._$main = this.$('.main');

        return this;
    }

    _onReady() {
        this._ready = true;

        if (this._activeView) {
            this._attachContent(this._activeView);
            this._activeView = undefined;
        }
    }

    _onRouteUser(username) {
        if (this._userDetailViews.hasOwnProperty(username)) {
            this._attach(this._userDetailViews[username].render());
            return;
        }

        const users = this.model.get('users');
        const findPredicate = user => user.get('slack_username') === username;
        const user = users.find(findPredicate);

        if (user) {
            this._createAndAttachUserView(user);
        } else {
            // The users probably haven't been fetched yet
            users.fetch({
                success: _.bind(function() {
                    const user = users.find(findPredicate);

                    if (user) {
                        this._createAndAttachUserView(user);
                    } else {
                        console.log('Could not find a User with slack username "%s"', username);
                    }
                }, this)
            });
        }
    }

    _createAndAttachUserView(user) {
        const view = new UserDetailView({ model: user });
        this._userDetailViews[user.slack_username] = view;
        this._attachContent(view);
        view.render();
        return view;
    }

    _attachContent(view) {
        if (this._ready) {
            this._$main
                .children().detach().end()
                .append(view.el);
        } else {
            // Save the view to attach later, once everything is ready.
            this._activeView = view;
        }
    }
}
