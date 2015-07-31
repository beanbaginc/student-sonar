import _ from 'underscore';
import Backbone from 'backbone';


class Group extends Backbone.Model {}


/*
 * GroupByCollection is a proxy that wraps a collection but groups items into
 * sub-collections via a predicate. It can also filter items out of the groups.
 */
export default class GroupByCollection extends Backbone.Collection {
    constructor(models, options) {
        const groupModel = options.model;
        options.model = Group;

        super(models, options);

        this._groupModel = groupModel;
        this._parentCollection = options.parentCollection;
        this._groupByKey = options.groupByKey;

        this.setFilter(options.filter);
        this.listenTo(this._parentCollection, 'add', this._onAdd);
        this.listenTo(this._parentCollection, 'remove', this._onRemove);
        this.listenTo(this._parentCollection, 'change', this._update);
    }

    setFilter(filter) {
        this._filter = filter;
        this._update();
    }

    _update() {
        this.reset(null);
        this._parentCollection.each(this._onAdd, this);
    }

    _onAdd(model) {
        if (this._filter && !this._filter(model)) {
            return;
        }

        const key = this._groupByKey(model);
        let group = this.find(model => model.get('key') === key);

        if (!group) {
            group = new Group(
                {
                    key: key,
                    collection: new Backbone.Collection([], {
                        model: this._groupModel
                    })
                });
            this.add(group);
        }

        group.get('collection').add(model);
    }

    _onRemove(model) {
        if (this._filter && !this._filter(model)) {
            return;
        }

        const key = this._groupByKey(model);
        const group = this.find(model => model.get('key') === key);
        if (group) {
            const groupCollection = group.get('collection');
            groupCollection.remove(model);

            if (groupCollection.length === 0) {
                this.remove(group);
            }
        }
    }
}
