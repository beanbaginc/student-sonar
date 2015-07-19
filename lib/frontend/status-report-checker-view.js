import _ from 'underscore';
import Backbone from 'backbone';

import FilteredCollection from './filtered-collection';
import {User} from './models';
import {intersectionExists} from './util';


export default class StatusReportCheckerView extends Backbone.View {
    constructor(options) {
        super(options);

        this._template = _.template(`
            <h1>Status Reports Due</h1>
            <% _.each(dueDates, function(dueDate) { %>
                <%= dueDate.date.format('ddd, MMM D') %><br/>

                <% if (dueDate.users.submitted) { %>
                    Submitted:<br/>
                    <% _.each(dueDate.users.submitted, function(user) { %>
                        <img src="<%= user.get('avatar') %>"
                             width="32" height="32"
                             alt="<%= user.get('name') %>">
                    <% }); %>
                <% } %>

                <% if (dueDate.users.due) { %>
                    Due:<br/>
                    <% _.each(dueDate.users.due, function(user) { %>
                        <img src="<%= user.get('avatar') %>"
                             width="32" height="32"
                             alt="<%= user.get('name') %>">
                    <% }); %>
                <% } %>
            <% }); %>
            `);
    }

    render() {
        const dueDates = this.model.get('statusReportDueDates').map(function(dueDate) {
            const date = dueDate.get('date');
            const showToGroups = dueDate.get('show_to_groups');
            const users = this.model.get('users').chain()
                .filter(model => intersectionExists(showToGroups,
                                                    model.get('groups')))
                .groupBy(model =>
                    _.find(model.get('status_reports'),
                           report => date.isSame(report.date_due, 'day'))
                    ? 'submitted' : 'due')
                .value();

            return _.defaults({
                users: users
            }, dueDate.attributes);
        }.bind(this));

        this.$el
            .empty()
            .html(this._template({ dueDates: dueDates }));

        return this;
    }
}
