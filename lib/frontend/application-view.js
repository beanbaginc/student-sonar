import _ from 'underscore';
import Backbone from 'backbone';

import AdminView from './admin-view';
import HeaderView from './header-view';
import IndexView from './index-view';
import UserDetailView from './user-detail-view';


/*
 * ApplicationView is a view that wraps the entire application. It shows a
 * header, and then shows different sub-views for each page.
 */
export default class ApplicationView extends Backbone.View {
    constructor(options) {
        options.id = 'app';
        super(options);

        this._$content = $(`
            <div id="content">
                <div id="spinner"><span class="fa fa-refresh fa-spin"></span></div>
            </div>
            `);

        this._headerView = new HeaderView({ model: this.model.get('me') });
        this._adminView = new AdminView({ model: this.model });
        this._indexView = new IndexView({ model: this.model });
        this._userViews = {};

        this.listenTo(this._headerView, 'go-admin', function() {
            this.model.go('/admin');
        });
        this.listenTo(this._indexView, 'go-user', function(user) {
            this.model.go(`user/${user.get('slack_username')}`);
        });
        this.listenTo(this.model, 'route:admin', this._onRouteAdmin);
        this.listenTo(this.model, 'route:user', this._onRouteUser);
        this.listenTo(this.model, 'route:root', this._onRouteRoot);
    }

    render() {
        this.$el
            .empty()
            .append(this._headerView.render().el)
            .append(this._$content);

        return this;
    }

    _onRouteAdmin() {
        this._attachContent(this._adminView.render());
    }

    _onRouteUser(username) {
        if (this._userViews.hasOwnProperty(username)) {
            this._attach(this._userViews[username].render());
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
        this._userViews[user.slack_username] = view;
        this._attachContent(view);
        view.render();
        return view;
    }

    _onRouteRoot() {
        this._attachContent(this._indexView.render());
    }

    _attachContent(view) {
        this._$content
            .children().detach().end()
            .append(view.el);
    }
}
