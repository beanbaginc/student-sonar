import Backbone from 'backbone';

import * as models from './models';


/*
 * Application contains the basic data and routing for the application.
 */
export default class Application extends Backbone.Model {
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
}
