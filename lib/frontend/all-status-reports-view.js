import _ from 'underscore';
import Backbone from 'backbone';
import moment from 'moment';
import 'bootstrap-datepicker';

import CollectionView from './collection-view';
import Confirm from './confirm';
import FilteredCollection from './filtered-collection';
import {User} from './models';
import {intersectionExists} from './util';
import './editable-selectize';


class DatePickerEditable extends $.fn.editabletypes.abstractinput {
    constructor(options) {
        super();

        this.init('datepicker', options, {
            inputclass: '',
            tpl: '<input type="text" class="form-control input-sm">'
        });
    }

    render() {
        this.$input.datepicker({
            autoclose: true,
            format: 'yyyy-mm-dd',
            orientation: 'top left'
        });
    }

    value2html(value, element) {
        if (!value) {
            $(element).empty();
        } else {
            $(element).text(value);
        }
    }

    html2value(html) {
        return moment(html);
    }

    value2str(value) {
        if (value) {
            return value.format('YYYY-MM-DD');
        } else {
            return '';
        }
    }

    str2value(str) {
        return moment(str);
    }

    value2input(value) {
        this.$input.datepicker('update', value.toDate());
    }

    input2value() {
        return moment(this.$input.datepicker('getDate'));
    }

    activate() {
        this.$input.datepicker('show');
    }
}


$.fn.editabletypes.datepicker = DatePickerEditable;


class StatusReportsRowView extends Backbone.View {
    constructor(options) {
        options = Object.create(options);
        options.tagName = 'tr';
        super(options);

        this._template = _.template(`
            <td>
                <time id="date"><%- date.format('YYYY-MM-DD') %></time>
                <button type="button" id="delete-button" class="btn btn-default btn-xs">
                    <span class="fa fa-trash-o"></span>
                </button>
            </td>
            <td>
                <span class="tags" id="groups">
                    <% showToGroups.forEach(function(group) { %>
                        <span class="label label-default"><%- group %></span>
                    <% }) %>
                </span>
            </td>
            <td class="avatars">
                <% submitted.forEach(function(user) { %>
                    <a href="/status/view/<%- user.reportId %>">
                        <img class="avatar img-rounded" src="<%- user.avatar %>"
                             title="<%- user.name %>"
                             alt="<%- user.name %>">
                    </a>
                <% }) %>
            </td>
            <td class="avatars">
                <% due.forEach(function(user) { %>
                    <img class="avatar img-rounded" src="<%- user.avatar %>"
                         title="<%- user.name %>"
                         alt="<%- user.name %>">
                <% }) %>
            </td>
            `);

        this._rendered = false;
        this.listenTo(window.application, 'change:manage', this._onManageChanged);
        this.listenTo(this.model, 'change', function() {
            if (this._rendered) {
                this.render();
            }
        });
    }

    events() {
        return {
            'click #delete-button': '_onDeleteClicked'
        };
    }

    render() {
        const model = this.model;
        const date = model.get('date');
        const dueDateId = model.get('id');
        const showToGroups = model.get('show_to_groups');

        const groups = window.application.get('groups');
        const statusReports = window.application.get('statusReports');
        const users = window.application.get('users');

        const submitted = [];
        const due = [];

        users.chain()
            .filter(user => intersectionExists(showToGroups, user.get('groups')))
            .each(function(user) {
                const data = {
                    avatar: user.get('avatar'),
                    name: user.get('name')
                };

                const report = statusReports.find(report =>
                    report.get('date_due') === dueDateId &&
                    report.get('user') === user.get('id'));

                if (report) {
                    data.reportId = report.get('id');
                    submitted.push(data);
                } else {
                    due.push(data);
                }
            });

        this.$el.html(this._template({
            date: date,
            showToGroups: showToGroups,
            due: due,
            submitted: submitted
        }));

        this.$('a').click(function(ev) {
            window.application.go($(this).attr('href'));
            return false;
        });

        this._$deleteButton = this.$('#delete-button');

        this.$el.removeClass('danger success');

        if (date < moment()) {
            this.$el.addClass(due.length > 0 ? 'danger' : 'success');
        }

        this.$('#date')
            .editable({
                display: function(value) {
                    return value.format('YYYY-MM-DD');
                },
                format: 'YYYY-MM-DD',
                mode: 'inline',
                savenochange: true,
                success: (response, newValue) => model.save({
                    date: newValue
                }),
                type: 'datepicker',
                unsavedclass: null
            })
            .on('shown', this._$deleteButton.hide.bind(this._$deleteButton))
            .on('hidden', this._$deleteButton.show.bind(this._$deleteButton));

        this.$('#groups').editable({
            display: function(value) {
                if (_.isFunction(value)) {
                    value = value();
                }

                const $el = $(this).empty();

                value.split(',').forEach(
                    groupName => $('<span class="label label-default">')
                        .text(groupName)
                        .appendTo($el));
            },
            mode: 'inline',
            selectize: {
                create: true,
                delimiter: ',',
                options: groups.pluck('group_id').map(
                    group => {
                        return { text: group, value: group };
                    }),
                plugins: ['remove_button']
            },
            success: (response, newValue) => model.save({
                show_to_groups: new Set(newValue.split(','))
            }),
            type: 'selectize',
            unsavedclass: null,
            value: this.model.getGroupsString.bind(this.model)
        });

        this._rendered = true;
        this._onManageChanged();

        return this;
    }

    _onManageChanged() {
        if (this._rendered) {
            const manage = window.application.get('manage');
            this.$('.editable').editable(manage ? 'enable' : 'disable');

            if (manage) {
                this._$deleteButton.show();
            } else {
                this._$deleteButton.hide();
            }
        }
    }

    _onDeleteClicked() {
        const confirmDlg = new Confirm(
            'Delete status report due date?',
            'This action cannot be undone. If there are submitted status reports for this, those will be orphaned.',
            {
                accept_button_text: 'Delete',
                accept_button_class: 'btn-danger'
            });

        this.listenTo(confirmDlg, 'accept', function() {
            this.model.destroy();
        });
    }
}


export default class AllStatusReportsView extends Backbone.View {
    constructor(options) {
        options.className = 'all-status-reports content-inner';
        super(options);

        this._template = _.template(`
            <div class="panel panel-default">
                <div class="panel-heading">All Status Reports</div>
                <table class="table">
                    <col class="date-column">
                    <col>
                    <col>
                    <col>
                    <col>
                    <thead>
                        <tr>
                            <th>Due Date</th>
                            <th>Groups</th>
                            <th>Submitted</th>
                            <th>Not Submitted</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4">
                                <button type="button" class="btn btn-default" id="add">
                                    Add new due date
                                </button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            `);

        this._rendered = false;

        this.listenTo(window.application, 'change:manage', this._onManageChanged);
    }

    events() {
        return {
            'click #add': '_onAddClicked'
        };
    }

    render() {
        this.$el.html(this._template);

        const groups = new Set(
            window.application.get('groups')
                .filter(group => group.get('show'))
                .map(group => group.get('group_id')));

        const collection = new FilteredCollection(null, {
            parentCollection: this.model.get('statusReportDueDates'),
            filter: model => {
                let showTo = model.get('show_to_groups');

                return (showTo.size === 0 || intersectionExists(showTo, groups));
            }
        });

        this._rowsView = new CollectionView({
            childViewType: StatusReportsRowView,
            collection: collection,
            el: this.$('tbody')
        }).render();

        this._rendered = true;
        this._onManageChanged();

        return this;
    }

    _onManageChanged() {
        if (this._rendered) {
            const manage = this.model.get('manage');

            if (manage) {
                this.$('tfoot').show();
            } else {
                this.$('tfoot').hide();
            }
        }
    }

    _onAddClicked() {
        this.model.get('statusReportDueDates').create({
            date: moment(),
            show_to_groups: new Set()
        });
    }
}
