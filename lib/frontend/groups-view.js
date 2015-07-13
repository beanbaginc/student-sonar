import _ from 'underscore';
import Backbone from 'backbone';

import CollectionView from './collection-view';
import FilteredCollection from './filtered-collection';
import {User} from './models';


/*
 * UserCardView shows the avatar and real name of the user, and emits an
 * 'activate' event when clicked.
 */
class UserCardView extends Backbone.View {
    constructor(options) {
        super(options);

        this._template = _.template(`
            <img class="avatar" src="<%= avatar %>" alt="">
            <span class="name"><%= name %></span>
            `);

        this.listenTo(this.model, 'change', this.render);
    }

    events() {
        return {
            'click': 'onClick'
        };
    }

    render() {
        this.$el.html(this._template(this.model.attributes));
        return this;
    }

    onClick() {
        this.trigger('activate', this.model);
    }
}


/*
 * UsersByGroupView is a CollectionView of UserCardViews that passes through
 * the 'activate' event.
 */
class UsersByGroupView extends CollectionView {
    createChildView(model) {
        const view = new UserCardView({
            className: 'user-card',
            model: model
        });
        this.listenTo(view, 'activate',
                      model => this.trigger('activate', model));
        return view;
    }
}


/*
 * GroupView shows all of the users in the given group. It also passes through
 * the 'activate' event from UserCardView.
 */
class GroupView extends Backbone.View {
    constructor(options) {
        options.classname = 'group';
        super(options);

        this._users = options.users;
        this._template = _.template(`
            <h2><%= name %></h2>
            `);
    }

    render() {
        this.$el.html(this._template(this.model.attributes));

        const groupId = this.model.get('group_id');
        const usersByGroupView = new UsersByGroupView({
            collection: new FilteredCollection([], {
                comparator: 'name',
                filter: model => _.contains(model.get('groups'), groupId),
                model: User,
                parentCollection: this._users
            }),
            childViewType: UserCardView
        });
        this.listenTo(usersByGroupView, 'activate',
                      model => this.trigger('activate', model));

        this.$el.append(usersByGroupView.render().el);

        return this;
    }
}


/*
 * GroupsView shows a set of GroupView views for each of the groups in the
 * collection. It passes through the 'activate' event from the UserCardView.
 */
export default class GroupsView extends CollectionView {
    constructor(options) {
        this._users = options.users;

        options.className = 'groups';
        super(options);
    }

    createChildView(model) {
        const view = new GroupView({
            model: model,
            users: this._users
        });
        this.listenTo(view, 'activate',
                      model => this.trigger('activate', model));
        return view;
    }
}
