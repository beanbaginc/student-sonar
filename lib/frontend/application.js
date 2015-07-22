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
                'status': 'status',
                'user/:username': 'user',
                '': 'root'
            }
        });

        const me = new models.User(window.user, { parse: true });
        this.get('users').add(me);
        this.set('me', me);

        this._proxyEvent(this._router, 'route');
        this._proxyEvent(this._router, 'route:calendar');
        this._proxyEvent(this._router, 'route:root');
        this._proxyEvent(this._router, 'route:status');
        this._proxyEvent(this._router, 'route:user');
    }

    _proxyEvent(obj, event) {
        this.listenTo(obj, event, function() {
            this.trigger(event, ...(_.toArray(arguments)));
        });
    }

    defaults() {
        return {
            calendar: new models.CalendarItemCollection(),
            groups: new models.GroupCollection(),
            statusReportDueDates: new models.StatusReportDueDateCollection(),
            users: new models.UserCollection(),
            me: null,
            ready: false,
            manage: false
        };
    }

    start() {
        Promise.all([
            this.attributes.calendar.fetch(),
            this.attributes.groups.fetch(),
            this.attributes.statusReportDueDates.fetch(),
            this.attributes.users.fetch()
        ]).then(function() {
            this.set('ready', true);
            this.trigger('ready');
        }.bind(this));

        Backbone.history.start({
            pushState: true
        });
    }

    go(url) {
        this._router.navigate(url, {trigger: true});
    }
}
