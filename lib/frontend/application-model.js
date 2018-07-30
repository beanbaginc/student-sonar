import Backbone from 'backbone';

import * as models from './models';


/*
 * Application contains the basic data and routing for the application.
 */
export default class Application extends Backbone.Model {
    defaults() {
        const loggedIn = (window.userType !== 'anonymous');

        return {
            users: loggedIn ? new models.UserCollection() : null,
            ready: false,
        };
    }

    start() {
        const loggedIn = (window.userType !== 'anonymous');

        if (loggedIn) {
            Promise.all([
                this.attributes.users.fetch()
            ]).then(() => {
                this.set('ready', true);
                this.trigger('ready');
            });
        } else {
            this.set('ready', true);
            this.trigger('ready');
        }
    }
}
