import _ from 'underscore';
import Backbone from 'backbone';


/*
 * CollectionView is a generic view to show collections. It will update itself
 * when items are added or removed, or when the collection is sorted.
 *
 * To define the view type for items, either childViewType should be passed in
 * to the options, or a subclass should override createChildView.
 */
export default class CollectionView extends Backbone.View {
    constructor(options) {
        options = options || {};
        super(options);

        this._childViewType = options.childViewType;
        this._childViews = [];
        this._rendered = false;

        this.collection.each(this._onAdd, this);
        this.listenTo(this.collection, 'add', this._onAdd);
        this.listenTo(this.collection, 'remove', this._onRemove);
        this.listenTo(this.collection, 'sort', this._onSort);
        this.listenTo(this.collection, 'reset', this._onReset);
    }

    createChildView(model) {
        if (!this._childViewType) {
            throw "No childViewType provided";
        }
        return new this._childViewType({
            model: model
        });
    }

    _onAdd(model) {
        const view = this.createChildView(model);
        this._childViews.push(view);

        if (this._rendered) {
            this.$el.append(view.render().el);
        }
    }

    _onRemove(model) {
        const view = _.find(this._childViews, view => view.model === model);
        this._childViews = _.without(this._childViews, view);

        if (this._rendered) {
            view.$el.remove();
        }
    }

    _onSort() {
        // XXX: this is pretty inefficient
        this._childViews = this.collection.map(
            model => this._childViews.find(view => view.model === model));

        if (this._rendered) {
            this.$el.children().detach();
            _.each(this._childViews, view => this.$el.append(view.el));
        }
    }

    _onReset() {
        _.each(this._childViews, view => view.remove());
        this._childViews = [];
        this.collection.each(this._onAdd, this);
    }

    render() {
        this._rendered = true;
        this.$el.empty();

        _.each(this._childViews,
               function(view) {
                   this.$el.append(view.render().el);
               },
               this);

        return this;
    }
}
