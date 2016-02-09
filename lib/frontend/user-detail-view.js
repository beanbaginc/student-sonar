import $ from 'jquery';
import _ from 'underscore';
import _fetch from 'fetch';
import Backbone from 'backbone';
import calendarHeatmap from 'cal-heatmap';
import marked from 'marked';
import moment from 'moment';
import 'bootstrap';
import 'x-editable/dist/bootstrap3-editable/js/bootstrap-editable';

import CollectionView from './collection-view';
import GroupByCollection from './group-by-collection';
import {intersectionExists} from './util';
import './editable-epiceditor';
import './editable-selectize';


class LinkEditable extends $.fn.editabletypes.abstractinput {
    constructor(options) {
        super();

        this._template = _.template(`
            <a
                <% if (href) { %>href="<%- href %>" <% } %>
                <% if (color) { %>style="color: <%- color %>;" <% } %>
                ><%- text %></a>
            `);

        this.init('link', options, {
            inputclass: '',
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
                `
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
        const links = this.model.get(this._property) || [];
        const $ul = $('<ul class="link-list" />')
            .appendTo(this.$el);

        links.forEach((link, index) => {
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
        });

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
        const links = this.model.get(this._property) || [];

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
                <div class="bio-entry"><span id="name"><%- name %></span></div>
                <div class="bio-entry"><span id="school"><%- school %></span></div>
                <div class="bio-entry"><span id="email"><a href="mailto:<%- email %>"><%- email %></a></span></div>
                <div class="bio-entry"><span id="primary_mentor"><%- primary_mentor %></span></div>
            </div>
            <div class="extended-info">
                <dl class="dl-horizontal">
                    <dt>Groups:</dt>
                    <dd>
                        <span id="groups" class="tags">
                            <% groups.forEach(function(group) { %>
                                <span class="label label-default"><%- group %></span>
                            <% }); %>
                        </span>
                    </dd>

                    <dt>RB username:</dt>
                    <dd><span id="rb_username"><%- rb_username %></span></dd>

                    <dt>Slack username:</dt>
                    <dd><%- slack_username %></dd>

                    <dt>Timezone:</dt>
                    <dd><%- timezone %></dd>
                </dl>
            </div>
            `);
    }

    render() {
        const application = window.application;
        const model = this.model;
        const saveOptions = {
            wait: true
        };

        this.$el.html(this._template(_.defaults(model.attributes, {
            rb_username: ''
        })));

        this.$('#school').editable({
            mode: 'inline',
            type: 'text',
            unsavedclass: null,
            success: function(response, newValue) {
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

        const mentors = application.get('users')
            .filter(user => user.get('type') === 'mentor')
            .map(user => ({
                id: user.id,
                avatar: user.get('avatar'),
                name: user.get('name')
            }));

        const mentorTemplate = _.template(`
            <div>
                <img src="<%- avatar %>" class="mentor-choice">
                <%- name %>
            </div>
            `);

        this.$('#primary_mentor').editable({
            mode: 'inline',
            type: 'selectize',
            unsavedclass: null,
            selectize: {
                create: false,
                options: mentors,
                labelField: 'name',
                searchField: 'name',
                valueField: 'id',
                maxItems: 1,
                render: {
                    item: mentorTemplate,
                    option: mentorTemplate
                }
            },
            success: function(response, newValue) {
                model.save({
                    primary_mentor: newValue
                }, saveOptions);
            },
            display: function(value) {
                const mentor = mentors.find(i => i.id === value);
                if (mentor) {
                    $(this).html(mentorTemplate(mentor));
                } else {
                    $(this).empty();
                }
            },
            value: this.model.get('primary_mentor')
        });

        this.$('#rb_username').editable({
            mode: 'inline',
            type: 'text',
            unsavedclass: null,
            success: function(response, newValue) {
                model.save({
                    rb_username: newValue
                }, saveOptions);
            }
        });

        this.$('#groups').editable({
            mode: 'inline',
            type: 'selectize',
            unsavedclass: null,
            selectize: {
                create: true,
                delimiter: ',',
                options: application.get('groups').pluck('group_id').map(
                    group => ({ text: group, value: group })),
                plugins: ['remove_button']
            },
            success: function(response, newValue) {
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

                if (value) {
                    value.split(',').forEach(groupName =>
                        $('<span class="label label-default">')
                            .text(groupName)
                            .appendTo($el));
                }
            },
            value: this.model.getGroupsString.bind(this.model)
        });

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
            iconFAClass: '',
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
                <% if (iconURL) { %>
                <img src="<%- iconURL %>" width="16" height="16" alt="">
                <% } %>
                <% if (iconFAClass) { %>
                <span class="fa <%- iconFAClass %>"></span>
                <% } %>
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

        this.rbLogoURL = '/images/reviewboard-logo.png';

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
            className: 'event-list timeline',
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
        const application = window.application;
        const attrs = this.model.attributes;

        this._$details = $('<div class="details" />');
        this.$el
            .empty()
            .append(this._userBioView.render().el)
            .append(this._$details);

        if (attrs.projects && attrs.projects.length) {
            // Old-style project links
            this._createLinks('Projects', 'projects');
        } else {
            let $projects = $('<div/>');
            this._createSummaryEntry('Projects', $projects);
            this._updateProjects(this.model, $projects);
        }

        this._createLinks('Demo Videos', 'demos');

        this._updateStatusReports();

        if (attrs.slack_username) {
            let $history = $('<div/>');
            this._createSummaryEntry('Chat History', $history);
            this._updateChatHistory(this.model, $history);
        }

        if (attrs.rb_username) {
            let $reviewRequests = $('<div/>');
            this._createSummaryEntry('Review Requests', $reviewRequests);
            this._updateReviewRequests(this.model, $reviewRequests);

            let $reviews = $('<div/>');
            this._createSummaryEntry('Code Reviews', $reviews);
            this._updateReviews(this.model, $reviews);
        }

        let $notes = $('<div class="notes" />');
        this._createSummaryEntry('Notes', $notes);
        this._updateNotes(this.model, $notes);

        this._createSummaryEntry('Timeline', this._timelineView.render().el);

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

    _updateStatusReports() {
        const eventsCollection = this._eventsCollection;
        const attrs = this.model.attributes;
        const dueDates = application.get('statusReportDueDates')
            .filter(d => intersectionExists(d.get('show_to_groups'), attrs.groups))
            .sort((a, b) => a.get('date').isBefore(b.get('date')) ? -1 : 1);

        if (attrs.status_reports && attrs.status_reports.length) {
            // Old-style status reports
            this._createLinks('Status Reports', 'status_reports');
        }

        if (dueDates.length > 0) {
            // New-style status reports
            const statusReports = application.get('statusReports')
                .chain()
                .filter(d => d.get('user') === attrs.id);

            const $ul = $('<ul class="link-list" />');
            const now = moment();

            dueDates.forEach(function(dueDate) {
                const dateDue = dueDate.get('date');
                const statusReport = statusReports.find(
                    d => d.get('date_due') === dueDate.get('id'))
                    .value();

                if (statusReport) {
                    const $li = $('<li>')
                        .appendTo($ul);
                    const dateSubmitted = statusReport.get('date_submitted');

                    const link = `/status/view/${statusReport.get('id')}`;

                    const $a = $('<a/>')
                        .attr('href', link)
                        .text(dateDue.format('D MMM YYYY'))
                        .click(function() {
                            application.go(link);
                            return false;
                        })
                        .appendTo($li);

                    let eventText = 'Status Report';
                    if (dateDue < dateSubmitted) {
                        $('<span class="text-warning" />')
                            .text (' (late)')
                            .appendTo($a);

                        eventText += ` (was due ${dateDue.format('ddd, MMM D')})`;
                    }

                    eventsCollection.add(new TimelineEvent({
                        date: dateSubmitted,
                        iconFAClass: 'fa-list',
                        linkURL: link,
                        summary: eventText
                    }));
                } else {
                    const $li = $('<li>')
                        .text(dateDue.format('D MMM YYYY'))
                        .appendTo($ul);

                    if (dateDue < now) {
                        $('<span class="text-danger" />')
                            .text(' (missing)')
                            .appendTo($li);
                    }
                }
            }, this);

            this._createSummaryEntry('Status Reports', $ul);
        }
    }

    _updateProjects(user, $projects) {
        $('<span class="fa fa-refresh fa-spin">')
            .appendTo($projects);

        const projects = window.application.get('projects');

        projects.fetch().then(() => {
            const email = user.get('email');
            const $ul = $('<ul class="link-list" />');

            projects.each(section => {
                section.get('tasks')
                    .where({assignee_email: email})
                    .forEach(task => {
                        const $li = $('<li>')
                            .appendTo($ul);

                        const projectURL = `/projects/${task.get('id')}`;
                        const $a = $('<a>')
                            .attr('href', projectURL)
                            .click(() => {
                                window.application.go(projectURL);
                                return false;
                            })
                            .appendTo($li);

                        $a.text(task.get('name'));

                        if (task.get('completed')) {
                            $('<span>')
                                .css('color', 'green')
                                .text('[Completed] ')
                                .prependTo($a);
                        }
                    });
            });

            $projects
                .empty()
                .append($ul);
        });
    }

    _updateNotes(user, $notes) {
        let $editable = $('<div/>').appendTo($notes);

        $editable.editable({
            defaultValue: '',
            mode: 'inline',
            type: 'epicEditor',
            unsavedclass: null,
            showbuttons: 'bottom',
            epicEditor: {
                autogrow: true
            },
            $parent: $notes,
            success: function(response, newValue) {
                user.save({ notes: newValue }, { wait: true });
            },
            display: function(value) {
                marked.setOptions({
                    gfm: true,
                    breaks: true,
                    sanitize: true,
                    smartLists: true,
                    smartypants: true
                });

                $(this).html(marked(value));
            },
            value: user.get('notes')
        });
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

    _updateReviewRequests(user, $reviewRequests) {
        const eventsCollection = this._eventsCollection;

        $('<span class="fa fa-refresh fa-spin">')
            .appendTo($reviewRequests);

        fetch(`/api/review-requests/${user.get('rb_username')}`)
            .then(result => result.json())
            .then(result => {
                const $ul = $('<ul/>');

                for (let rr of result.review_requests) {
                    if (!rr.public) {
                        continue;
                    }

                    const $li = $('<li/>').appendTo($ul);
                    const $a = $('<a/>')
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
                        iconURL: this.rbLogoURL,
                        linkURL: rr.absolute_url,
                        summary: `${rr.id}: ${rr.summary}`
                    }));

                    for (let change of rr.changes) {
                        if (change.fields_changed.diff !== undefined) {
                            eventsCollection.add(new TimelineEvent({
                                date: moment(change.timestamp),
                                iconURL: this.rbLogoURL,
                                linkURL: rr.absolute_url,
                                summary: `${rr.id}: ${rr.summary}`,
                                detailsHTML: change.text
                            }));
                        }
                    }
                }

                $reviewRequests
                    .empty()
                    .append($ul);
            });
    }

    _updateReviews(user, $reviews) {
        let eventsCollection = this._eventsCollection;

        $('<span class="fa fa-refresh fa-spin">')
            .appendTo($reviews);

        fetch(`/api/reviews/${user.get('rb_username')}`)
            .then(result => result.json())
            .then(result => {
                const $ul = $('<ul class="link-list" />');

                for (let r of result.reviews) {
                    if (!r.public) {
                        continue;
                    }

                    let $li = $('<li/>').appendTo($ul);
                    let $a = $('<a/>')
                        .attr('href', r.absolute_url)
                        .text('code review') // TODO: figure out good text here
                        .appendTo($li);

                    eventsCollection.add(new TimelineEvent({
                        date: moment(r.timestamp),
                        iconURL: this.rbLogoURL,
                        linkURL: r.absolute_url,
                        summary: 'code review'
                    }));
                }

                $reviews
                    .empty()
                    .append($ul);
            });
    }

    _onManageChanged(application, manage) {
        this.$('.editable').editable(manage ? 'enable' : 'disable');
    }
}
