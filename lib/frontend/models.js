import Backbone from 'backbone';
import moment from 'moment';


class MongooseModel extends Backbone.Model {
    parse(response, options) {
        let data = super.parse(response, options);

        data.id = data._id;
        delete data._id;
        delete data.__v;

        return data;
    }
}


export class CalendarItem extends MongooseModel {
    parse(response, options) {
        let data = super.parse(response, options);
        data.date = moment(data.date);
        return data;
    }
}


export class CalendarItemCollection extends Backbone.Collection {
    constructor(models, options) {
        super(models, options);

        this.model = CalendarItem;
        this.url = '/api/calendar-items';
    }
}


export class Group extends MongooseModel {}


export class GroupCollection extends Backbone.Collection {
    constructor(models, options) {
        super(models, options);

        this.model = Group;
        this.url = '/api/groups';
    }

    comparator(model) {
        return model.get('name');
    }
}


export class User extends MongooseModel {
    defaults() {
        return {
            school: ''
        };
    }
}


export class UserCollection extends Backbone.Collection {
    constructor(models, options) {
        options = options || {};
        options.comparator = model => model.get('name');
        super(models, options);

        this.model = User;
        this.url = '/api/users';
    }
}
