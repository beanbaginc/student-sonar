import _ from 'underscore';
import Backbone from 'backbone';

import CollectionView from './collection-view';


class AllStudentsRowView extends Backbone.View {
    constructor(options) {
        options = Object.create(options);
        options.tagName = 'tr';
        super(options);

        this._template = _.template(`
            <td>
                <% if (avatar) { %>
                    <img src="<%- avatar %>" class="img-rounded" width="24" height="24">
                <% } %>
                <%- name %>
            </td>
            <td>
                <% if (school) { %>
                    <%- school %>
                <% } %>
            </td>
            <td>
                <%- email %>
            </td>
            <td>
                <span class="tags">
                    <% groups.forEach(function(group) { %>
                        <span class="label label-default"><%- group %></span>
                    <% }) %>
                </span>
            </td>
            `);
    }

    events() {
        return {
            'click': '_onClick'
        };
    }

    render() {
        this.$el.html(this._template(this.model.attributes));
        return this;
    }

    _onClick() {
        window.application.go(`/users/${this.model.get('slack_username')}`);
        return false;
    }
}


export default class AllStudentsListView extends Backbone.View {
    constructor(options) {
        options.className = 'all-students-list content-inner';
        super(options);

        this._template = `
            <div class="panel panel-default">
                <div class="panel-heading">All Students</div>
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>School</th>
                            <th>E-mail Address</th>
                            <th>Groups</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
            `;
    }

    render() {
        this.$el.html(this._template);

        this._rowsView = new CollectionView({
            childViewType: AllStudentsRowView,
            collection: this.model.get('users'),
            el: this.$('tbody')
        }).render();

        return this;
    }
}
