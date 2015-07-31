import $ from 'jquery';
import _ from 'underscore';
import _fetch from 'fetch';
import Backbone from 'backbone';
import calendarHeatmap from 'cal-heatmap';
import moment from 'moment';
import 'x-editable/dist/bootstrap3-editable/js/bootstrap-editable';

import CollectionView from './collection-view';
import GroupByCollection from './group-by-collection';


class LinkEditable extends $.fn.editabletypes.abstractinput {
    constructor(options) {
        super();

        this._template = _.template(`
            <a
                <% if (href) { %>href="<%= href %>" <% } %>
                <% if (color) { %>style="color: <%= color %>;" <% } %>
                ><%= text %></a>
            `);

        this.init('link', options, {
            tpl: `
                <div class="editable-link">
                    <label>
                        <span>Text:</span>
                        <input type="text" name="text">
                    </label>
                </div>
                <div class="editable-link">
                    <label>
                        <span>URL:</span>
                        <input type="text" name="href">
                    </label>
                </div>
                <div class="editable-link">
                    <label>
                        <span>Color:</span>
                        <input type="text" name="color">
                    </label>
                </div>
                `,
            inputclass: ''
        });
    }

    render() {
        this._$text = this.$tpl.find('input[name="text"]');
        this._$href = this.$tpl.find('input[name="href"]');
        this._$color = this.$tpl.find('input[name="color"]');
    }

    value2html(value, element) {
        if (!value) {
            $(element).empty();
        } else {
            $(element).html(this._template(value));
        }
    }

    html2value(html) {
        // TODO: should this be implemented?
        return null;
    }

    value2str(value) {
        return _.values(value).join(':');
    }

    str2value(str) {
        return str;
    }

    value2input(value) {
        if (value) {
            this._$text.val(value.text);
            this._$href.val(value.href);
            this._$color.val(value.color);
        }
    }

    input2value() {
        return {
            text: this._$text.val(),
            href: this._$href.val(),
            color: this._$color.val()
        };
    }

    activate() {
        this._$text.focus();
    }
}

$.fn.editabletypes.link = LinkEditable;


class LinksView extends Backbone.View {
    constructor(options) {
        super(options);

        this._property = options.property;
        this._rendered = false;
    }

    events() {
        return {
            'click #add-link': '_onAddClicked'
        };
    }

    render() {
        this.$el.empty();
        const links = this.model.get(this._property);
        const $ul = $('<ul class="link-list" />')
            .appendTo(this.$el);

        _.each(links, function(link, index) {
            const $li = $('<li />')
                .appendTo($ul);

            $('<button type="button" class="delete-button btn btn-default btn-xs" />')
                .append('<span class="fa fa-trash-o" />')
                .appendTo($li)
                .click(this._onDeleteClicked.bind(this, index));

            const $a = $('<a />')
                .text(link.text)
                .appendTo($li);

            if (link.href) {
                $a.attr('href', link.href);
            }

            if (link.color) {
                $a.css('color', link.color);
            }

            $a.editable({
                type: 'link',
                value: link,
                placement: 'right',
                unsavedclass: null,
                success: this._onEditableSave.bind(this, index)
            });
        }, this);

        this.$el.append(`
            <button type="button" class"btn btn-default" id="add-link">
                Add new link
            </button>
            `);

        if (!this._rendered) {
            this.listenTo(this.model, `change:${this._property}`, this.render);

            const application = window.application;
            this.listenTo(application, 'change:manage', this._onManageChanged);
            this._onManageChanged(application, application.get('manage'));

            this._rendered = true;
        }

        return this;
    }

    _onManageChanged(application, manage) {
        if (manage) {
            this.$('#add-link').show();
            this.$('.delete-button').show();
        } else {
            this.$('#add-link').hide();
            this.$('.delete-button').hide();
        }
    }

    _onEditableSave(index, response, value) {
        const links = this.model.get(this._property);

        if (index !== null) {
            links[index] = value;
        } else {
            links.push(value);
        }

        this.model.save({ [this._property]: links }, { wait: true });
    }

    _onDeleteClicked(index) {
        const links = this.model.get(this._property);
        links.splice(index, 1);
        this.model.save({ [this._property]: links }, {
            wait: true,
            // XXX: for some reason the change handler isn't working: rerender
            // manually
            success: this.render.bind(this)
        });
    }

    _onAddClicked() {
        const $ul = this.$('ul');
        const $li = $('<li />')
            .appendTo($ul);

        const $a = $('<a />')
            .text('New link')
            .appendTo($li);

        $a
            .on('init', function(e, editable) {
                _.delay(editable.show.bind(editable), 100);
            })
            .editable({
                type: 'link',
                value: {
                    text: '',
                    href: '',
                    color: ''
                },
                placement: 'right',
                unsavedclass: null,
                success: this._onEditableSave.bind(this, null)
            })
            .on('hidden', function(e, reason) {
                if (reason === 'cancel') {
                    $a.editable('destroy');
                    $li.remove();
                }
            });
    }
}


class UserBioView extends Backbone.View {
    constructor(options) {
        super(options);

        this._template = _.template(`
            <div class="bio">
                <img class="avatar" src="<%- avatar %>" alt="">
                <div><span id="name"><%- name %></span></div>
                <div><span id="school"><%- school %></span></div>
                <div><span id="email"><a href="mailto:<%- email %>"><%- email %></a></span></div>
            </div>
            <div class="extended-info">
                <dl class="dl-horizontal">
                    <dt>Groups:</dt>
                    <dd>
                        <span id="groups">
                            <% groups.forEach(function(group) { %>
                                <span class="label label-default"><%= group %></span>
                            <% }); %>
                        </span>
                    </dd>

                    <dt>RB username:</dt>
                    <dd><span id="rb_username"><%= rb_username %></span></dd>

                    <dt>Slack username:</dt>
                    <dd><%= slack_username %></dd>

                    <dt>Timezone:</dt>
                    <dd><%= timezone %></dd>
                </dl>
            </div>
            `);
    }

    render() {
        const model = this.model;
        const saveOptions = {
            wait: true
        };

        this.$el.html(this._template(model.attributes));

        this.$('#school').editable({
            mode: 'inline',
            type: 'text',
            unsavedclass: null,
            success: function(response, newValue) {
                // TODO: some kind of visual feedback
                model.save({
                    school: newValue
                }, saveOptions);
            }
        });

        this.$('#email').editable({
            mode: 'inline',
            type: 'text',
            unsavedclass: null,
            success: function(response, newValue) {
                // TODO: some kind of visual feedback
                model.save({
                    email: newValue
                }, saveOptions);
            },
            display: function(value) {
                $('<a>')
                    .attr('href', `mailto:${value}`)
                    .text(value)
                    .appendTo($(this).empty());
            }
        });

        this.$('#rb_username').editable({
            mode: 'inline',
            type: 'text',
            unsavedclass: null,
            success: function(response, newValue) {
                // TODO: some kind of visual feedback
                model.save({
                    rb_username: newValue
                }, saveOptions);
            }
        });

        this.$('#groups').editable({
            mode: 'inline',
            type: 'text',
            unsavedclass: null,
            success: function(response, newValue) {
                // TODO: some kind of visual feedback
                model.save({
                    groups: new Set(newValue.split(','))
                }, saveOptions);
            },
            display: function(value) {
                if (_.isFunction(value)) {
                    value = value();
                }

                const groups = value.split(',');
                const $el = $(this).empty();

                _.each(value.split(','),
                    groupName => $('<span class="label label-default">')
                        .text(groupName)
                        .appendTo($el));
            },
            value: this.model.getGroupsString.bind(this.model)
        });

        const application = window.application;
        this.listenTo(application, 'change:manage', this._onManageChanged);
        this._onManageChanged(application, application.get('manage'));

        return this;
    }

    _onManageChanged(application, manage) {
        if (manage) {
            this.$('.extended-info').show();
        } else {
            this.$('.extended-info').hide();
        }

        const editableState = manage ? 'enable' : 'disable';
        this.$('#school').editable(editableState);
        this.$('#email').editable(editableState);
        this.$('#rb_username').editable(editableState);
        this.$('#groups').editable(editableState);
    }
}


/*
 * TimelineEvent represents an event to be shown in the timeline section of the
 * page.
 */
class TimelineEvent extends Backbone.Model {
    defaults() {
        return {
            date: null,
            iconURL: '',
            linkURL: '',
            summary: '',
            detailsHTML: ''
        };
    }
}


/*
 * TimelineEventView renders a given TimelineEvent.
 */
class TimelineEventView extends Backbone.View {
    constructor(options) {
        options.tagName = 'li';
        super(options);

        this._template = _.template(`
            <a href="<%- linkURL %>">
                <img src="<%- iconURL %>" width="16" height="16" alt="">
                <%- summary %>
            </a>
            <% if (detailsHTML) { %>
            <div class="timeline-details"><%= detailsHTML %></div>
            <% } %>
            `);
    }

    render() {
        this.$el.html(this._template(this.model.attributes));
        return this;
    }
}


/*
 * TimelineDayView is an individual day within the timeline. It has a
 * sub-collection for each event that occurs within that day.
 */
class TimelineDayView extends Backbone.View {
    constructor(options) {
        options.className = 'event-list-day';
        options.tagName = 'li';

        super(options);

        this._itemsView = new CollectionView({
            childViewType: TimelineEventView,
            collection: this.model.get('collection'),
            tagName: 'ul'
        });

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
 * UserDetailView is one of the major views in sonar. It shows everything about
 * a user. On the left is their bio information (name, avatar picture, e-mail
 * address, school name, etc.). On the right is a bunch of sections
 * corresponding to pertinent data--a list of projects, status reports, links
 * to review requests, etc.
 */
export default class UserDetailView extends Backbone.View {
    constructor(options) {
        options.className = 'user-detail';
        super(options);

        this._eventsCollection = new Backbone.Collection([], {
            model: TimelineEvent
        });

        this._timelineCollection = new GroupByCollection([], {
            parentCollection: this._eventsCollection,
            groupByKey: model => model.get('date').startOf('day').unix(),
            comparator: (a, b) => b.get('key') - a.get('key')
        });
        this._timelineView = new CollectionView({
            childViewType: TimelineDayView,
            className: 'event-list',
            collection: this._timelineCollection,
            tagName: 'ul'
        });

        this._template = _.template(`
            <div class="details"></div>
            `);

        this._summaryEntryTemplate = _.template(`
            <div class="summary-entry">
                <div class="summary-entry-title"><%- title %></div>
                <div class="summary-entry-content"><%= content %></div>
            </div>
            `);

        this._userBioView = new UserBioView({ model: this.model });
    }

    render() {
        let attrs = this.model.attributes;

        this._$details = $('<div class="details" />');
        this.$el
            .empty()
            .append(this._userBioView.render().el)
            .append(this._$details);

        if (attrs.projects) {
            this._createLinks('Projects', 'projects');
        }

        if (attrs.demos) {
            this._createLinks('Demo Videos', 'demos');
        }

        if (attrs.status_reports) {
            this._createLinks('Status Reports', 'status_reports');
        }

        if (attrs.slack_username) {
            let $history = $('<div/>');
            this._createSummaryEntry('Chat History', $history);
            this._updateChatHistory(this.model, $history);
        }

        if (attrs.rb_username) {
            let $reviewRequests = $('<ul/>');
            this._createSummaryEntry('Review Requests', $reviewRequests);
            this._updateReviewRequests(this.model, $reviewRequests);
        }

        this._createSummaryEntry('Timeline', this._timelineView.render().el);

        const application = window.application;
        this.listenTo(application, 'change:manage', this._onManageChanged);
        this._onManageChanged(application, application.get('manage'));

        return this;
    }

    _createSummaryEntry(title, contentEl) {
        let $entry = $(this._summaryEntryTemplate({
            title: title,
            content: ''
        }));
        this._$details.append($entry);
        $entry.children('.summary-entry-content').append(contentEl);
    }

    _createLinks(title, property) {
        const linksView = new LinksView({
            model: this.model,
            property: property
        });

        this._createSummaryEntry(title, linksView.render().el);
    }

    _updateChatHistory(user, $history) {
        fetch(`/api/slack-logs/${user.get('slack_username')}`)
            .then(result => result.json())
            .then(function(logs) {
                let data = {};

                for (let log of logs) {
                    let key = log.timestamp.toString();

                    if (data[key] === undefined) {
                        data[key] = 1;
                    } else {
                        data[key] += 1;
                    }
                }

                let start = moment().startOf('month').subtract(11, 'months');

                let heatmap = new calendarHeatmap();
                heatmap.init({
                    data: data,
                    displayLegend: false,
                    domain: 'month',
                    highlight: 'now',
                    itemSelector: $history[0],
                    start: start.toDate(),
                    subDomain: 'day',
                    tooltip: true,
                    weekStartOnMonday: false
                });
            });
    }

    _updateReviewRequests(user, $reviewRequests, $timeline) {
        let eventsCollection = this._eventsCollection;

        fetch(`/api/review-requests/${user.get('rb_username')}`)
            .then(result => result.json())
            .then(function(result) {
                const rbLogoURL = '/images/reviewboard-logo.png';

                for (let rr of result.review_requests) {
                    if (!rr.public) {
                        continue;
                    }

                    let $li = $('<li/>').appendTo($reviewRequests);
                    let $a = $('<a/>')
                        .attr('href', rr.absolute_url)
                        .text(rr.summary)
                        .appendTo($li);

                    if (rr.status === 'submitted') {
                        $('<span>')
                            .css('color', 'green')
                            .text('[Submitted] ')
                            .prependTo($a);
                    } else if (rr.status === 'discarded') {
                        $('<span>')
                            .css('color', 'red')
                            .text('[Discarded] ')
                            .prependTo($a);
                    }

                    eventsCollection.add(new TimelineEvent({
                        date: moment(rr.time_added),
                        iconURL: rbLogoURL,
                        linkURL: rr.absolute_url,
                        summary: `${rr.id}: ${rr.summary}`
                    }));

                    for (let change of rr.changes) {
                        if (change.fields_changed.diff !== undefined) {
                            eventsCollection.add(new TimelineEvent({
                                date: moment(change.timestamp),
                                iconURL: rbLogoURL,
                                linkURL: rr.absolute_url,
                                summary: `${rr.id}: ${rr.summary}`,
                                detailsHTML: _.escape(change.text)
                            }));
                        }
                    }
                }
            });
    }

    _onManageChanged(application, manage) {
        this.$('.editable').editable(manage ? 'enable' : 'disable');
    }
}
