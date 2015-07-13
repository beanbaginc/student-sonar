import _ from 'underscore';
import Backbone from 'backbone';
import moment from 'moment';

import CollectionView from './collection-view';
import GroupByCollection from './group-by-collection';


/*
 * CalendarItemView renders a single CalendarItem.
 */
class CalendarItemView extends Backbone.View {
    constructor(options) {
        options.tagName = 'li';
        super(options);
    }

    render() {
        this.$el.text(this.model.get('summary'));
        return this;
    }
}


/*
 * CalendarDayView is an individual day within the calendar. It has a
 * sub-collection for each event that occurs within that day.
 */
class CalendarDayView extends Backbone.View {
    constructor(options) {
        options.className = 'event-list-day';
        options.tagName = 'li';

        super(options);

        this._itemsView = new CollectionView({
            childViewType: CalendarItemView,
            collection: this.model.get('collection'),
            tagName: 'ul'
        });

        this._rendered = false;
        this.listenTo(this.model, 'change:key', this._updateTime);
        this._updateTime();
    }

    render() {
        this.$el.empty();

        $('<time/>')
            .text(this._date.format('ddd, MMM D'))
            .appendTo(this.$el);

        this.$el.append(this._itemsView.render().el);

        this._rendered = true;

        return this;
    }

    _updateTime() {
        this._date = moment.unix(this.model.get('key'));
        if (this._rendered) {
            this.render();
        }
    }
}


/*
 * CalendarView shows the header and calendar items, and handles grouping and
 * sorting.
 */
export default class CalendarView extends Backbone.View {
    constructor(options) {
        options = options || {};
        options.className = 'calendar';
        super(options);

        const comparator = options.reversed ?
                           (a, b) => b.get('key') - a.get('key') :
                           (a, b) => a.get('key') - b.get('key');

        this._groupByCollection = new GroupByCollection([], {
            parentCollection: options.collection,
            filter: options.filter,
            groupByKey: model => model.get('date').startOf('day').unix(),
            comparator: comparator
        });

        this._eventListView = new CollectionView({
            childViewType: CalendarDayView,
            className: 'event-list',
            collection: this._groupByCollection,
            tagName: 'ul'
        });
    }

    render() {
        this.$el
            .empty()
            .append('<h1>Calendar</h1>')
            .append(this._eventListView.render().el);
        return this;
    }
}
