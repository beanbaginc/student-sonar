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

        return new Promise((resolve, reject) => {
            super.fetch(_.defaults({
                success: () => {
                    if (_.isFunction(options.success)) {
                        options.success.apply(this, arguments);
                    }

                    resolve(this);
                },
                error: () => {
                    if (_.isFunction(options.error)) {
                        options.error.apply(this, arguments);
                    }

                    reject();
                }
            }, options));
        });
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


export class StatusReport extends MongooseModel {
    defaults() {
        return {
            date_due: null,
            date_submitted: moment(),
            text: '',
            user: null
        };
    }

    parse(response, options) {
        const data = super.parse(response, options);
        data.date_submitted = moment(data.date_submitted);
        return data;
    }

    toJSON() {
        return {
            date_due: this.attributes.date_due,
            date_submitted: this.attributes.date_submitted.format(),
            text: this.attributes.text,
            user: this.attributes.user
        };
    }
}


export class StatusReportCollection extends APICollection {
    constructor(models, options) {
        super(models, options);

        this.model = StatusReport;
        this.url = '/api/status-reports';
    }
}


export class StatusReportDueDate extends MongooseModel {
    parse(response, options) {
        const data = super.parse(response, options);
        data.date = moment(data.date);
        data.show_to_groups = new Set(data.show_to_groups);
        return data;
    }

    getGroupsArray() {
        const groups = [];

        for (let group of this.attributes.show_to_groups.keys()) {
            groups.push(group);
        }

        return groups;
    }

    toJSON() {
        return {
            date: this.attributes.date.endOf('day').utc().toDate(),
            show_to_groups: this.getGroupsArray()
        };
    }

    getGroupsString() {
        return this.getGroupsArray().join(',');
    }
}


export class StatusReportDueDateCollection extends APICollection {
    constructor(models, options) {
        options = options || {};
        options.comparator = model => model.get('date');
        super(models, options);

        this.model = StatusReportDueDate;
        this.url = '/api/status-report-due-dates';
    }
}


export class User extends MongooseModel {
    defaults() {
        return {
            avatar: '',
            email: '',
            primary_mentor: '',
            school: '',
            type: 'student'
        };
    }

    parse(response, options) {
        const data = super.parse(response, options);
        data.groups = new Set(data.groups);
        return data;
    }

    getGroupsArray() {
        const groups = [];

        for (let group of this.attributes.groups.keys()) {
            groups.push(group);
        }

        return groups;
    }

    getGroupsString() {
        return this.getGroupsArray().join(',');
    }

    toJSON() {
        const data = super.toJSON();
        data.groups = this.getGroupsArray();
        data.primary_mentor = data.primary_mentor || null;
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
