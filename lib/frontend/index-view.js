import _ from 'underscore';
import Backbone from 'backbone';
import moment from 'moment';

import CalendarView from './calendar-view';
import FilteredCollection from './filtered-collection';
import GroupsView from './groups-view';


/*
 * IndexView is the main view for the "index", which shows a calendar of
 * upcoming events and a list of active groups.
 */
export default class IndexView extends Backbone.View {
    constructor(options) {
        options.id = 'index';
        super(options);

        this._rendered = false;
    }

    render() {
        if (!this._rendered) {
            const today = moment().startOf('day');
            const calendarFilter = model => (
                model.get('date') >= today &&
                (_.contains(window.user.groups, 'mentors') ||
                 _.any(window.user.groups,
                       group => _.contains(model.get('show_to_groups'), group))));

            this._calendarView = new CalendarView({
                collection: this.model.get('calendar'),
                filter: calendarFilter
            }).render();

            this._groupsView = new GroupsView({
                collection: new FilteredCollection([], {
                    filter: model => model.get('show'),
                    parentCollection: this.model.get('groups')
                }),
                users: this.model.get('users')
            }).render();
            this.listenTo(this._groupsView, 'activate',
                          model => this.trigger('go-user', model));

            this.$el.append(this._calendarView.el);
            this.$el.append(this._groupsView.el);

            this._rendered = true;
        }

        return this;
    }
}
