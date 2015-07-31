import _ from 'underscore';
import Backbone from 'backbone';
import moment from 'moment';

import {intersectionExists} from './util';


export default class MyStatusReportsView extends Backbone.View {
    constructor(options) {
        options.className = 'my-status-reports content-inner';
        super(options);

        this._template = `
            <div class="panel panel-default">
                <div class="panel-heading">My Status Reports</div>
                <div class="list-group"></div>
            </div>
            `;

        this._itemTemplate = _.template(`
            <a href="<%- link %>" class="list-group-item <%- itemClass %>">
                <time><%- dueDate.get('date').format('ddd, MMM D') %></time>
                <span><%- description %></span>
            </a>
            `);

        this._ready = this.model.get('ready');
        this._rendered = false;

        this.listenTo(this.model, 'ready', this._onReady);
    }

    render() {
        this._rendered = true;

        if (this._ready) {
            const me = this.model.get('me');
            const myGroups = me.get('groups');

            const statusReports = this.model.get('statusReports')
                .filter(d => d.get('user') === me.get('id'));

            const dueDates = this.model.get('statusReportDueDates')
                .filter(d => intersectionExists(d.get('show_to_groups'), myGroups))
                .sort((a, b) => a.date - b.date);

            this.$el.html(this._template);

            if (dueDates) {
                const $list = this.$('.list-group');

                const now = moment();

                for (let dueDate of dueDates) {
                    const dueDateId = dueDate.get('id');
                    const report = _.find(statusReports,
                                          d => d.get('date_due') === dueDateId);

                    const diff = dueDate.get('date').diff(now, 'days', true);
                    let itemClass;
                    let description;

                    if (report) {
                        itemClass = 'list-group-item-success';
                        description = 'Submitted';
                    } else if (diff < 0) {
                        itemClass = 'list-group-item-danger';
                        description = 'Past Due';
                    } else if (diff < 3) {
                        itemClass = 'list-group-item-warning';
                        description = 'Due Soon';
                    } else {
                        itemClass = '';
                        description = '';
                    }

                    const link = `/status/edit/${dueDateId}`;

                    const $item = $(this._itemTemplate({
                            description: description,
                            dueDate: dueDate,
                            itemClass: itemClass,
                            link: link,
                            report: report
                        }))
                        .click(() => {
                            this.model.go(link);
                            return false;
                        })
                        .appendTo($list);
                }
            } else {
                this.$el.append('<div class="nothing">Nothing to see here, move along.</div>');
            }
        }

        return this;
    }

    _onReady() {
        this._ready = true;

        if (this._rendered) {
            this.render();
        }
    }
}
