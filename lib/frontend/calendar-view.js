import _ from 'underscore';
import Backbone from 'backbone';
import moment from 'moment';
import Pikaday from 'pikaday';
import 'bootstrap';
import 'bootstrap-tagsinput';
import 'typeahead';

import CollectionView from './collection-view';
import Confirm from './confirm';
import GroupByCollection from './group-by-collection';
import {CalendarItem} from './models';
import {intersectionExists} from './util';


/*
 * EditCalendarItemView is a dialog that provides an editor for a given
 * calendar item.
 */
class EditCalendarItemView extends Backbone.View {
    constructor(options) {
        options.className = 'modal fade';
        options.id = 'calendar-edit';
        super(options);

        this._template = _.template(`
             <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal">
                            <span class="fa fa-close"></span>
                        </button>
                        <h4 class="modal-title">
                            <% if (isNew) { %>
                                Create new event
                            <% } else { %>
                                Edit event
                            <% } %>
                        </h4>
                    </div>
                    <div class="modal-body">
                        <form class="form-horizontal">
                            <div class="form-group">
                                <label for="calendar-edit-date" class="col-sm-2 control-label">Date:</label>
                                <div class="col-sm-3">
                                    <input type="text" class="form-control" id="calendar-edit-date"
                                           value="<%= date.format('YYYY-MM-DD') %>">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="calendar-edit-summary" class="col-sm-2 control-label">Summary:</label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" id="calendar-edit-summary"
                                           value="<%= summary %>">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="calendar-edit-groups" class="col-sm-2 control-label">Groups:</label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" data-role="tagsinput"
                                           id="calendar-edit-groups" value="<%= groups %>">
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" id="cancel-button" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-default" id="save-button">Save</button>
                    </div>
                </div>
             </div>
        `);
    }

    events() {
        return {
            'click #save-button': '_onSaveClicked'
        };
    }

    render() {
        this.$el.html(this._template(_.defaults({
            isNew: this.model.isNew(),
            groups: Array.from(this.model.get('show_to_groups')).join(',')
        }, this.model.attributes)));

        this._pikaday = new Pikaday({
            field: this.$('#calendar-edit-date')[0]
        });

        const groupIds = window.application.get('groups').pluck('group_id');

        console.log(this.$('#calendar-edit-groups').tagsinput({
            tagClass: 'label label-default',
            typeaheadjs: {
                source: new Bloodhound({
                    local: groupIds,
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    datumTokenizer: Bloodhound.tokenizers.whitespace
                })
            }
        }));

        return this;
    }

    remove() {
        this._pikaday.destroy();
        super.remove();
    }

    _onSaveClicked() {
        this.$('button').prop('disabled');

        const isNew = this.model.isNew();
        const attrs = {
            date: this._pikaday.getMoment(),
            show_to_groups: new Set(this.$('#calendar-edit-groups').val().split(',')),
            summary: this.$('#calendar-edit-summary').val()
        };
        const options = {
            success: function() {
                this.$el.modal('hide');
            }.bind(this),
            error: function() {
                $('<div class="alert alert-danger">')
                    .text('Failed to save calendar item')
                    .prependTo(this.$('.modal-body'));

                this.$('button.close').prop('disabled', false);
                this.$('#cancel-button').prop('disabled', false);
            }.bind(this)
        };

        if (isNew) {
            this.collection.create(attrs, options);
        } else {
            this.model.save(attrs, options);
        }
    }
}


/*
 * CalendarItemView renders a single CalendarItem.
 */
class CalendarItemView extends Backbone.View {
    constructor(options) {
        options.tagName = 'li';
        options.className = 'calendar-item';
        super(options);

        this._rendered = false;
        this._template = _.template(`
            <% if (manage) { %>
                <div class="btn-group">
                    <button type="button" id="edit-button" class="btn btn-default btn-xs">
                        <span class="fa fa-edit"></span>
                    </button>
                    <button type="button" id="delete-button" class="btn btn-default btn-xs">
                        <span class="fa fa-trash-o"></span>
                    </button>
                </div>
            <% } %>
            <%= summary %>
            <% if (manage) { %>
                <div class="labels">
                    <% _.each(Array.from(show_to_groups), function(group) { %>
                        <span class="label label-default"><%= group %></span>
                    <% }); %>
                </div>
            <% } %>
            `);
        this.listenTo(window.application, 'change:manage', this._onManageChanged);
    }

    events() {
        return {
            'click #edit-button': '_onEditClicked',
            'click #delete-button': '_onDeleteClicked'
        };
    }

    render() {
        this.$el
            .empty()
            .html(this._template(_.defaults({
                manage: window.application.get('manage')
            }, this.model.attributes)));

        if (!this._rendered) {
            this.listenTo(this.model, 'change', this.render);
        }

        this._rendered = true;

        return this;
    }

    _onManageChanged() {
        if (this._rendered) {
            this.render();
        }
    }

    _onDeleteClicked() {
        const confirmDlg = new Confirm(
            'Delete calendar item?',
            'This action cannot be undone',
            {
                accept_button_text: 'Delete',
                accept_button_class: 'btn-danger'
            });

        this.listenTo(confirmDlg, 'accept', function() {
            this.model.destroy();
        });
    }

    _onEditClicked() {
        const editView = new EditCalendarItemView({ model: this.model });
        $('body').append(editView.el);
        editView.render();

        editView.$el
            .modal()
            .on('hidden.bs.modal', function() {
                editView.remove();
            });
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

        const today = moment().startOf('day');
        const me = this.model.get('me');
        const myGroups = me.get('groups');
        this._filter = model => (
            model.get('date') >= today &&
            (me.isAdmin() || intersectionExists(myGroups,
                                                model.get('show_to_groups'))));

        this._groupByCollection = new GroupByCollection([], {
            parentCollection: this.model.get('calendar'),
            groupByKey: model => model.get('date').startOf('day').unix(),
            comparator: (a, b) => a.get('key') - b.get('key')
        });

        this._eventListView = new CollectionView({
            childViewType: CalendarDayView,
            className: 'event-list',
            collection: this._groupByCollection,
            tagName: 'ul'
        });

        this.listenTo(this.model, 'change:manage', this._onManageChanged);
        this._onManageChanged(this.model, this.model.get('manage'));
    }

    events() {
        return {
            'click #create-button': '_onCreateClicked'
        };
    }

    render() {
        this.$el
            .empty()
            .append(this._eventListView.render().el)
            .append(`
                <button type="button" id="create-button" class="btn btn-default">
                    Add new event
                </button>
                `);

        if (this.model.get('manage') === false) {
            this.$('#create-button').hide();
        }

        return this;
    }

    _onCreateClicked() {
        const editView = new EditCalendarItemView({
            collection: this.model.get('calendar'),
            model: new CalendarItem()
        });
        $('body').append(editView.el);
        editView.render();

        editView.$el
            .modal()
            .on('hidden.bs.modal', function() {
                editView.remove();
            });
    }

    _onManageChanged(model, manage) {
        if (manage) {
            this._groupByCollection.setFilter(undefined);
            this.$('#create-button').show();
        } else {
            this._groupByCollection.setFilter(this._filter);
            this.$('#create-button').hide();
        }
    }
}
