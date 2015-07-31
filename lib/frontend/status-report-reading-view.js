import _ from 'underscore';
import Backbone from 'backbone';
import marked from 'marked';
import moment from 'moment';


export default class StatusReportReadingView extends Backbone.View {
    constructor(options) {
        options.className = 'status-report-reading content-inner';
        super(options);

        this._reportId = options.reportId;

        this._template = _.template(`
            <div class="page-header">
                <h1>
                    Status Report for <%- dueDate.get('date').format('ddd, MMM D') %>
                    <small><%- user.get('name') %></small>
                </h1>
            </div>

            <%= rendered %>
            `);

        this._rendered = false;
        this._ready = this.model.get('ready');

        this.listenTo(this.model, 'ready', this._onReady);
    }

    render() {
        this._rendered = true;

        if (this._ready) {
            const report = this.model.get('statusReports').get(this._reportId);

            if (report) {
                const dueDate = this.model.get('statusReportDueDates').get(
                    report.get('date_due'));
                const user = this.model.get('users').get(report.get('user'));

                // TODO: show error + raw text if markdown fails
                marked.setOptions({
                    gfm: true,
                    breaks: true,
                    sanitize: true,
                    smartLists: true,
                    smartypants: true
                });
                const rendered = marked(report.get('text'));

                this.$el.html(this._template({
                    dueDate: dueDate,
                    rendered: rendered,
                    user: user
                }));
            } else {
                // TODO: show a "not found" error
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
