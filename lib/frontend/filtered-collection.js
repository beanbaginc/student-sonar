import Backbone from 'backbone';


/*
 * FilteredCollection is a proxy that wraps a collection but allows items to be
 * filtered out by a predicate.
 */
export default class FilteredCollection extends Backbone.Collection {
    constructor(models, options) {
        super(models, options);

        this._filter = options.filter;
        this._parentCollection = options.parentCollection;

        this._parentCollection.each(this._onAdd, this);
        this.listenTo(this._parentCollection, 'add', this._onAdd);
        this.listenTo(this._parentCollection, 'remove', this._onRemove);
    }

    _onAdd(model) {
        if (this._filter(model)) {
            this.add(model);
        }
    }

    _onRemove(model) {
        if (this._filter(model)) {
            this.remove(model);
        }
    }
}
