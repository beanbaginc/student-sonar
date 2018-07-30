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
