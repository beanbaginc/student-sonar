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
                'admin': 'admin',
                'user/:username': 'user',
                '': 'root'
            }
        });

        const me = new models.User(window.user);
        this.get('users').add(me);
        this.set('me', me);

        this.listenTo(this._router, 'route:admin', function() {
            this.trigger('route:admin');
        });
        this.listenTo(this._router, 'route:user', function(username) {
            this.trigger('route:user', username);
        });
        this.listenTo(this._router, 'route:root', function() {
            this.trigger('route:root');
        });
    }

    defaults() {
        return {
            calendar: new models.CalendarItemCollection(),
            groups: new models.GroupCollection(),
            users: new models.UserCollection(),
            me: null
        };
    }

    start() {
        this.attributes.calendar.fetch();
        this.attributes.groups.fetch();
        this.attributes.users.fetch();

        Backbone.history.start({
            pushState: true
        });
    }

    go(url) {
        this._router.navigate(url, {trigger: true});
    }
}
