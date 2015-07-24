import _ from 'underscore';
import Backbone from 'backbone';
import moment from 'moment';


class MongooseModel extends Backbone.Model {
    parse(response, options) {
        const data = super.parse(response, options);

        data.id = data._id;
        delete data._id;
        delete data.__v;

        return data;
    }
}


/*
 * APICollection extends the basic Backbone.Collection to make the fetch method
 * return a promise.
 */
class APICollection extends Backbone.Collection {
    fetch(options) {
        options = options || {};

        return new Promise(function(resolve, reject) {
            super.fetch(_.defaults({
                success: function() {
                    if (_.isFunction(options.success)) {
                        options.success.apply(this, arguments);
                    }

                    resolve(this);
                }.bind(this),
                error: function() {
                    if (_.isFunction(options.error)) {
                        oMaptions.error.apply(this, arguments);
                    }

                    reject();
                }.bind(this)
            }, options));
        }.bind(this));
    }
}


export class CalendarItem extends MongooseModel {
    parse(response, options) {
        const data = super.parse(response, options);
        data.date = moment(data.date);
        data.show_to_groups = new Set(data.show_to_groups);
        return data;
    }

    defaults() {
        return {
            date: '',
            show_to_groups: new Set(),
            summary: ''
        };
    }

    getGroupsString() {
        return Array.from(this.attributes.show_to_groups).join(',');
    }

    toJSON() {
        return {
            date: this.attributes.date.endOf('day').utc().format('YYYY-MM-DD'),
            show_to_groups: Array.from(this.attributes.show_to_groups),
            summary: this.attributes.summary
        };
    }
}


export class CalendarItemCollection extends APICollection {
    constructor(models, options) {
        super(models, options);

        this.model = CalendarItem;
        this.url = '/api/calendar-items';
    }
}


export class Group extends MongooseModel {}


export class GroupCollection extends APICollection {
    constructor(models, options) {
        super(models, options);

        this.model = Group;
        this.url = '/api/groups';
    }

    comparator(model) {
        return model.get('name');
    }
}


export class StatusReportDueDate extends MongooseModel {
    parse(response, options) {
        const data = super.parse(response, options);
        data.date = moment(data.date);
        data.show_to_groups = new Set(data.show_to_groups);
        return data;
    }

    comparator(model) {
        return model.get('date');
    }
}


export class StatusReportDueDateCollection extends APICollection {
    constructor(models, options) {
        super(models, options);

        this.model = StatusReportDueDate;
        this.url = '/api/status-report-due-dates';
    }
}


export class User extends MongooseModel {
    defaults() {
        return {
            school: ''
        };
    }

    parse(response, options) {
        const data = super.parse(response, options);
        data.groups = new Set(data.groups);
        return data;
    }

    isAdmin() {
        return this.get('groups').has('mentors');
    }

    toJSON() {
        const data = super.toJSON();
        data.groups = Array.from(this.attributes.groups);
        return data;
    }

    url() {
        if (this.isNew()) {
            return '/api/users';
        } else {
            return '/api/users/' + this.id;
        }
    }
}


export class UserCollection extends APICollection {
    constructor(models, options) {
        options = options || {};
        options.comparator = model => model.get('name');
        super(models, options);

        this.model = User;
        this.url = '/api/users';
    }
}
