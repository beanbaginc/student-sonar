import $ from 'jquery';
import _ from 'underscore';
import _fetch from 'fetch';
import Backbone from 'backbone';
import calendarHeatmap from 'cal-heatmap';
import moment from 'moment';

import CollectionView from './collection-view';
import GroupByCollection from './group-by-collection';


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
            <div class="bio">
                <h1 class="name"><%- name %></h1>
                <img class="avatar" src="<%- avatar %>" alt="">
                <h3 class="school"><%- school %></h3>
                <a class="email" href="mailto:<%- email %>"><%- email %></a>
            </div>
            <div class="details"></div>
            `);

        this._summaryEntryTemplate = _.template(`
            <div class="summary-entry">
                <div class="summary-entry-title"><%- title %></div>
                <div class="summary-entry-content"><%= content %></div>
            </div>
            `);

        this._linkListTemplate = _.template(`
            <ul>
            <% _.each(links, function(link) { %>
                <li>
                    <a <% if (link.href) { %>href="<%- link.href %>"<% } %>
                       <% if (link.color) { %>style="color: <%- link.color %>"<% } %>
                       ><%- link.text %></a>
                </li>
            <% }); %>
            </ul>
            `);
    }

    render() {
        let attrs = this.model.attributes;

        this.$el.html(this._template(attrs));
        this._$details = this.$('.details');

        if (attrs.projects) {
            this._createLinks('Projects', attrs.projects);
        }

        if (attrs.demos) {
            this._createLinks('Demo Videos', attrs.demos);
        }

        if (attrs.status_reports) {
            this._createLinks('Status Reports', attrs.status_reports);
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

    _createLinks(title, links) {
        this._$details.append(this._summaryEntryTemplate({
            title: title,
            content: this._linkListTemplate({links: links})
        }));
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
                            .text('[Submitted]')
                            .prependTo($a);
                    } else if (rr.status === 'discarded') {
                        $('<span>')
                            .css('color', 'red')
                            .text('[Discarded]')
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
}
