import _ from 'underscore';
import Backbone from 'backbone';

import * as models from './models';


/*
 * Application contains the basic data and routing for the application.
 */
export default class Application extends Backbone.Model {
    constructor(attributes, options) {
        super(attributes, options);

        this._router = new Backbone.Router({
            routes: {
                'calendar': 'calendar',
                'status': 'my-status-reports',
                'status/all': 'all-status-reports',
                'status/view/:reportId': 'view-status-report',
                'status/edit/:dueDateId': 'edit-status-report',
                'projects': 'projects',
                'projects/:id': 'project',
                'users': 'users',
                'users/:username': 'user',
                '': 'root'
            }
        });

        this._proxyRoute(this._router, 'route');
        this._proxyRoute(this._router, 'route:calendar');
        this._proxyRoute(this._router, 'route:root');
        this._proxyRoute(this._router, 'route:my-status-reports');
        this._proxyRoute(this._router, 'route:all-status-reports');
        this._proxyRoute(this._router, 'route:edit-status-report');
        this._proxyRoute(this._router, 'route:view-status-report');
        this._proxyRoute(this._router, 'route:users');
        this._proxyRoute(this._router, 'route:user');

        this._proxyMigratedRoute(this._router, 'route:projects');
        this._proxyMigratedRoute(this._router, 'route:project');
    }

    _proxyRoute(obj, event) {
        this.listenTo(
            obj, event, (...args) => this.trigger(event, ...args));
    }

    _proxyMigratedRoute(obj, event) {
        this.listenTo(
            obj, event, (...args) => this.trigger('route:migrated', ...args));
    }

    defaults() {
        const loggedIn = (window.userType !== 'anonymous');
        return {
            calendar: loggedIn ? new models.CalendarItemCollection() : null,
            groups: loggedIn ? new models.GroupCollection() : null,
            statusReports: loggedIn ? new models.StatusReportCollection() : null,
            statusReportDueDates: loggedIn ? new models.StatusReportDueDateCollection() : null,
            users: loggedIn ? new models.UserCollection() : null,
            projects: new models.StudentProjectCollection(),
            loggedIn: loggedIn,
            me: null,
            ready: false,
            manage: false
        };
    }

    start() {
        if (this.get('loggedIn')) {
            Promise.all([
                this.attributes.calendar.fetch(),
                this.attributes.groups.fetch(),
                this.attributes.statusReports.fetch(),
                this.attributes.statusReportDueDates.fetch(),
                this.attributes.users.fetch()
            ]).then(() => {
                this.set('me', this.get('users').get(window.userId));
                this.set('ready', true);
                this.trigger('ready');
            });
        } else {
            this.set('ready', true);
            this.trigger('ready');
        }

        Backbone.history.start({ pushState: true });
    }

    go(url) {
        this._router.navigate(url, {trigger: true});
    }
}
