// jshint ignore: start

import CalendarHeatmap from 'cal-heatmap';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import showdown from 'showdown';
import { NavLink } from 'react-router-dom';
import _ from 'underscore';

import Editable from './editable';
import { intersectionExists } from './util';


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


class Links extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            adding: false,
        };
    }

    render() {
        const { items, manage } = this.props;

        const links = items.map((link, i) => {
            const editableOptions = {
                disabled: !manage,
                type: 'link',
                value: link,
                placement: 'right',
                unsavedclass: null,
            };
            const style = {};

            if (link.color) {
                style.color = link.color;
            }

            return (
                <li key={`${i}-${link.href}`}>
                    <Editable
                        options={editableOptions}
                        onChange={link => this.saveLink(i, link)}>
                        <a href={link.href} style={style}>{link.text}</a>
                    </Editable>
                    {manage && (
                        <button
                            type="button"
                            className="delete-button btn btn-default btn-xs"
                            onClick={() => this.deleteLink(i)}>
                            <span className="fa fa-trash-o"></span>
                        </button>
                    )}
                </li>
            );
        });

        if (this.state.adding) {
            const editableOptions = {
                type: 'link',
                value: {
                    text: '',
                    href: '',
                    color: '',
                },
                placement: 'right',
                unsavedclass: null,
            };
            links.push(
                <li key="adding-link">
                    <Editable
                        options={editableOptions}
                        onChange={link => this.saveLink(null, link)}
                        onInit={(e, editable) => _.delay(() => editable.show(), 100)}
                        onHide={() => _.delay(() => this.setState({ adding: false }), 100)}>
                        <a>New link</a>
                    </Editable>
                </li>
            );
        }

        return (
            <React.Fragment>
                <ul className="link-list">{links}</ul>
                {manage && (
                    <button
                        type="button"
                        className="btn btn-default"
                        onClick={() => this.setState({ adding: true })}>
                        Add new link
                    </button>
                )}
            </React.Fragment>
        );
    }

    deleteLink(index) {
        const links = Array.from(this.props.items);
        links.splice(index, 1);
        this.props.onChange(links);
    }

    saveLink(index, link) {
        const links = Array.from(this.props.items);

        if (index !== null) {
            links[index] = link;
        } else {
            links.push(link);
        }

        this.props.onChange(links);
    }
}


class ModelLinksWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    componentDidMount() {
        window.application.on('change:manage', this.handleUpdate);
        this.props.model.on(`change:${this.props.property}`, this.handleUpdate);
    }

    componentWillUnmount() {
        window.application.off('change:manage', this.handleUpdate);
        this.props.model.off(`change:${this.props.property}`, this.handleUpdate);
    }

    handleUpdate() {
        this.forceUpdate();
    }

    render() {
        const { model, property } = this.props;

        return (
            <Links
                items={model.get(property) || []}
                onChange={links => model.save({ [property]: links }, { wait: true })}
                manage={window.application.get('manage')}
            />
        );
    }
}


class UserBio extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        window.application.on('change:manage', this.handleChange);
    }

    componentWillUnmount() {
        window.application.off('change:manage', this.handleChange);
    }

    componentDidUpdate(prevProps) {
    }

    handleChange() {
        this.forceUpdate();
    }

    render() {
        const manage = window.application.get('manage'); // TODO: switch to prop once parent updates
        const { model } = this.props;
        const {
            avatar,
            email,
            groups,
            name,
            primary_mentor,
            rb_username,
            school,
            slack_username,
            timezone,
        } = model.attributes;
        const saveOptions = { wait: true };

        // school editor
        const schoolEditableOptions = {
            disabled: !manage,
            mode: 'inline',
            type: 'text',
            unsavedclass: null,
        };

        // email editor
        const emailEditableOptions = {
            disabled: !manage,
            display: function(value) {
                $('<a>')
                    .attr('href', `mailto:${value}`)
                    .text(value)
                    .appendTo($(this).empty());
            },
            mode: 'inline',
            type: 'text',
            unsavedclass: null,
            value: email,
        };

        // primary mentor editor
        const mentors = window.application.get('users')
            .filter(user => user.get('type') === 'mentor')
            .map(user => ({
                id: user.id,
                avatar: user.get('avatar'),
                name: user.get('name'),
            }));

        const formatMentor = data => dedent`
            <div>
                <img src="${data.avatar}" class="mentor-choice" />
                ${data.name}
            </div>
        `;

        const mentorEditableOptions = {
            disabled: !manage,
            mode: 'inline',
            type: 'selectize',
            selectize: {
                create: false,
                options: mentors,
                labelField: 'name',
                searchField: 'name',
                valueField: 'id',
                maxItems: 1,
                render: {
                    item: formatMentor,
                    option: formatMentor,
                },
            },
            unsavedclass: null,
            display: function(value) {
                const mentor = mentors.find(i => i.id === value);
                $(this).html(mentor ? formatMentor(mentor) : '');
            },
            value: primary_mentor,
        };

        const initialMentorValue = mentors.find(i => i.id === primary_mentor);

        // rb username editor
        const rbUsernameEditableOptions = {
            disabled: !manage,
            mode: 'inline',
            type: 'text',
            unsavedclass: null,
            value: rb_username,
        };

        // groups editor
        const groupsEditableOptions = {
            disabled: !manage,
            mode: 'inline',
            type: 'selectize',
            selectize: {
                create: true,
                delimiter: ',',
                options: window.application.get('groups')
                    .pluck('group_id')
                    .map(group => ({ text: group, value: group })),
                plugins: ['remove_button'],
            },
            unsavedclass: null,
            display: function(value) {
                if (_.isFunction(value)) {
                    value = value();
                }

                const $el = $(this).empty();

                if (value) {
                    value.split(',').forEach(group =>
                        $('<span class="label label-default">')
                            .text(group)
                            .appendTo($el));
                }
            },
            value: model.getGroupsString.bind(model),
        };


        return (
            <React.Fragment>
                <div className="bio">
                    <img className="avatar" src={avatar} alt="" />
                    <div className="bio-entry"><span id="name">{name}</span></div>
                    <div className="bio-entry">
                        <Editable
                            options={schoolEditableOptions}
                            onChange={school => model.save({ school }, saveOptions)}>
                            {school}
                        </Editable>
                    </div>
                    <div className="bio-entry">
                        <Editable
                            options={emailEditableOptions}
                            onChange={email => model.save({ email }, saveOptions)}
                        />
                    </div>
                    <div className="bio-entry">
                        <Editable
                            options={mentorEditableOptions}
                            onChange={primary_mentor => model.save({ primary_mentor }, saveOptions)}
                        />
                    </div>
                </div>
                {manage && (
                    <div className="extended-info">
                        <dl className="dl-horizontal">
                            <dt>Groups:</dt>
                            <dd>
                                <Editable
                                    options={groupsEditableOptions}
                                    onChange={groups => model.save({ groups: new Set(groups.split(',')) }, saveOptions)}
                                />
                            </dd>

                            <dt>RB username:</dt>
                            <dd>
                                <Editable
                                    options={rbUsernameEditableOptions}
                                    onChange={rb_username => model.save({ rb_username }, saveOptions)}
                                />
                            </dd>

                            <dt>Slack username:</dt>
                            <dd>{slack_username}</dd>

                            <dt>Timezone:</dt>
                            <dd>{timezone}</dd>
                        </dl>
                    </div>
                )}
            </React.Fragment>
        );
    }
}


class Timeline extends React.Component {
    render() {
        const events = _.groupBy(
            this.props.events,
            event => event.date.startOf('day').unix());

        const days = Object.keys(events)
            .sort()
            .reverse()
            .map(key => {
                const day = events[key];
                const daysEvents = day.map((event, i) => {
                    const detailsContent = {
                        __html: event.details,
                    };

                    return (
                        <li key={`${key}-${i}`}>
                            <a href={event.linkURL}>
                                {event.iconURL && <img src={event.iconURL} width="16" height="16" alt="" />}
                                {event.iconFAClass && <span className={`fa ${event.iconFAClass}`}></span>}
                                {event.summary}
                            </a>
                            {event.details && (
                                <div className="timeline-details" dangerouslySetInnerHTML={detailsContent} />
                            )}
                        </li>
                    );
                });

                return (
                    <li key={key} className="event-list-day">
                        <time>{day[0].date.format('ddd, MMM D')}</time>
                        <ul>{daysEvents}</ul>
                    </li>
                );
            });

        return <ul className="event-list timeline">{days}</ul>;
    }
}


class Projects extends React.Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
        this.state = {
            tasks: null,
        };
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.user.id !== this.props.user.id) {
            this.update();
        }
    }

    update() {
        const projects = window.application.get('projects');

        this.setState({ tasks: null });

        projects.fetch().then(() => {
            const email = this.props.user.get('email');
            const tasks =
                [].concat(...projects.map(section =>
                    section.get('tasks').where({assignee_email: email})))
                .map(task => task.attributes);

            this.setState({ tasks });
        });
    }

    onClick(e) {
        // TODO: this can go away once we're entirely moved away from
        // Backbone.Router
        e.stopPropagation();
        e.preventDefault();

        const path = e.target.getAttribute('href');

        if (path) {
            window.application.go(path.substr(1));
        }
    }

    render() {
        if (this.state.tasks === null) {
            return <span className="fa fa-refresh fa-spin" />;
        }

        // TODO: switch to NavLink once there's no boundary between this and the
        // router.
        //                <NavLink
        //                    to={`/projects/${task.id}`} exact
        //                    onClick={onClick}>
        return (
            <ul className="link-list">
                {this.state.tasks.map(task => (
                    <li key={task.id}>
                        <a
                            href={`/projects/${task.id}`}
                            onClick={this.onClick}>
                            {task.completed && (
                                <span style={{color: 'green'}}>[Completed]</span>
                            )}
                            {task.name}
                        </a>
                    </li>
                ))}
            </ul>
        );
    }
}


const SummaryEntry = props => (
    <div className={`summary-entry ${props.className || ''}`}>
        <div className="summary-entry-title">{props.title}</div>
        <div className="summary-entry-content">{props.children}</div>
    </div>
);


class ChatHistory extends React.Component {
    constructor(props) {
        super(props);

        this.heatmap = null;
    }

    componentDidMount() {
        const start = moment().startOf('month').subtract(11, 'months');

        this.heatmap = new CalendarHeatmap();
        this.heatmap.init({
            data: [],
            displayLegend: false,
            domain: 'month',
            highlight: 'now',
            itemSelector: this.el,
            start: start.toDate(),
            subDomain: 'day',
            tooltip: true,
            weekStartOnMonday: false,
        });

        this.update();
    }

    componentDidUpdate(prevProps) {
        if (this.props.slack_username !== prevProps.slack_username) {
            this.update();
        }
    }

    componentWillUnmount() {
        this.heatmap.destroy();
        this.heatmap = null;
    }

    update() {
        this.heatmap.update([]);

        fetch(`/api/slack-logs/${this.props.slack_username}`)
            .then(result => result.json())
            .then(logs => {
                const data = {};

                for (let log of logs) {
                    const key = log.timestamp.toString();

                    if (data[key] === undefined) {
                        data[key] = 1;
                    } else {
                        data[key] += 1;
                    }
                }

                if (this.heatmap) {
                    this.heatmap.update(data);
                }
            });
    }

    render() {
        return <div ref={el => this.el = el} />;
    }
}


export default class UserDetail extends React.Component {
    rbLogoURL = '/images/reviewboard-logo.png';

    constructor(props) {
        super(props);

        this.update = this.update.bind(this);
        this.onNavClicked = this.onNavClicked.bind(this);

        this.events = [];
        this.state = {
            codeReviews: null,
            events: [],
            statusReports: null,
            reviewRequests: null,
            user: null,
        };
    }

    componentDidMount() {
        window.application.on('change:manage ready', this.update);
        this.update();
    }

    componentWillUnmount() {
        window.application.off('change:manage ready', this.update);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.userId !== this.props.match.params.userId) {
            this.update();
        }
    }

    update() {
        const user = window.application.get('users')
            .findWhere({ slack_username: this.props.match.params.userId });

        if (user) {
            this.setState({
                codeReviews: null,
                events: [],
                statusReports: null,
                reviewRequests: null,
                user: user,
            });

            this.events = [];
            this.updateCodeReviews(user);
            this.updateReviewRequests(user);
            this.updateStatusReports(user);
        }
    }

    updateCodeReviews(user) {
        fetch(`/api/reviews/${user.get('rb_username')}`)
            .then(result => result.json())
            .then(result => {
                const events = Array.from(this.events);
                const codeReviews = [];

                for (let r of result.reviews) {
                    if (!r.public) {
                        continue;
                    }

                    codeReviews.push({
                        id: r.id,
                        href: r.absolute_url,
                        summary: 'code review', // TODO: get better text
                    });

                    this.events.push({
                        date: moment(r.timestamp),
                        iconURL: this.rbLogoURL,
                        linkURL: r.absolute_url,
                        summary: 'code review', // TODO: get better text
                    });
                }

                this.setState({
                    codeReviews,
                    events: this.events,
                });
            });
    }

    updateReviewRequests(user) {
        fetch(`/api/review-requests/${user.get('rb_username')}`)
            .then(result => result.json())
            .then(result => {
                const reviewRequests = [];

                for (let rr of result.review_requests) {
                    if (!rr.public) {
                        continue;
                    }

                    reviewRequests.push({
                        href: rr.absolute_url,
                        id: rr.id,
                        summary: rr.summary,
                        status: rr.status,
                    });

                    this.events.push({
                        date: moment(rr.time_added),
                        iconURL: this.rbLogoURL,
                        linkURL: rr.absolute_url,
                        summary: `${rr.id}: ${rr.summary}`,
                    });

                    for (let change of rr.changes) {
                        if (change.fields_changed.diff !== undefined) {
                            this.events.push({
                                date: moment(change.timestamp),
                                iconURL: this.rbLogoURL,
                                linkURL: rr.absolute_url,
                                summary: `${rr.id}: ${rr.summary}`,
                                details: change.text,
                            });
                        }
                    }
                }

                this.setState({
                    events: this.events,
                    reviewRequests,
                });
            });
    }

    updateStatusReports(user) {
        const { groups, id } = user.attributes;
        const dueDates = window.application.get('statusReportDueDates')
            .filter(d => intersectionExists(d.get('show_to_groups'), groups))
            .sort((a, b) => a.get('date').isBefore(b.get('date')) ? -1 : 1);

        if (dueDates.length === 0) {
            this.setState({ statusReports: [] });
            return;
        }

        const now = moment();
        const usersStatusReports = window.application.get('statusReports')
            .filter(d => d.get('user') === id);

        const statusReports = dueDates.map(dueDate => {
            const due = dueDate.get('date');
            const statusReport = usersStatusReports.find(
                report => report.get('date_due') === dueDate.get('id'));

            if (statusReport) {
                const dateSubmitted = statusReport.get('date_submitted');
                const late = due < dateSubmitted;
                const link = `/status/view/${statusReport.get('id')}`;

                this.events.push({
                    date: dateSubmitted,
                    iconFAClass: 'fa-list',
                    linkURL: link,
                    summary: late
                        ? `Status Report (was due ${due.format('ddd. MMM D')})`
                        : 'Status Report',
                });

                return {
                    href: link,
                    late: late,
                    text: due.format('D MMM YYYY'),
                };
            } else {
                return {
                    text: due.format('D MMM YYYY'),
                    missing: due < now,
                };
            }
        });

        this.setState({
            events: this.events,
            statusReports,
        });
    }

    onNavClicked(e) {
        // TODO: this can go away once we're entirely moved away from
        // Backbone.Router
        e.stopPropagation();
        e.preventDefault();

        const path = e.target.getAttribute('href');

        if (path) {
            window.application.go(path.substr(1));
        }
    }

    render() {
        const {
            codeReviews,
            statusReports,
            reviewRequests,
            user,
        } = this.state;

        if (user === null) {
            return <span className="fa fa-refresh fa-spin" />;
        }

        const manage = window.application.get('manage');
        const {
            projects,
            slack_username: slackUsername,
            status_reports: legacyStatusReports,
        } = user.attributes;


        // TODO: switch to NavLink once there's a direct line to Router
        //                <NavLink
        //                    to={statusReport.href} exact
        //                    onClick={this.onNavClicked}>
        const statusReportsItems = statusReports === null
            ? <span className="fa fa-refresh fa-spin" />
            : statusReports.map(statusReport => (
                <li key={`${statusReport.href}-${statusReport.text}`}>
                    {statusReport.href ? (
                        <a
                            href={statusReport.href}
                            onClick={this.onNavClicked}>
                            {statusReport.text}
                            {statusReport.late && <span className="text-warning"> (late)</span>}
                        </a>
                    ) : (
                        <span>
                            {statusReport.text}
                            {statusReport.missing && <span className="text-danger"> (missing)</span>}
                        </span>
                    )}
                </li>
            ));

        const reviewRequestItems = reviewRequests === null
            ? <span className="fa fa-refresh fa-spin" />
            : reviewRequests.map(reviewRequest => (
                <li key={reviewRequest.id}>
                    <a href={reviewRequest.href}>
                        {reviewRequest.status === 'submitted' && <span style={{color: 'green'}}>[Submitted]</span>}
                        {reviewRequest.status === 'discarded' && <span style={{color: 'red'}}>[Discarded]</span>}
                        {reviewRequest.summary}
                    </a>
                </li>
            ));

        const codeReviewItems = codeReviews === null
            ? <span className="fa fa-refresh fa-spin" />
            : codeReviews.map(codeReview => (
                <li key={codeReview.id}>
                    <a href={codeReview.href}>{codeReview.summary}</a>
                </li>
            ));

        const converter = new showdown.Converter();
        converter.setFlavor('github');

        const notesEditableOptions = {
            disabled: !manage,
            display: function(value) {
                $(this).html(converter.makeHtml(value));
            },
            mode: 'inline',
            showbuttons: 'bottom',
            type: 'textarea',
            value: user.get('notes'),
            unsavedclass: null,
        };

        return (
            <div className="user-detail">
                <UserBio
                    manage={manage}
                    model={user}
                />
                <SummaryEntry title="Projects">
                    {(projects && projects.length) ? (
                        <ModelLinksWrapper
                            model={user}
                            property="projects"
                        />
                    ) : (
                        <Projects user={user} />
                    )}
                </SummaryEntry>
                <SummaryEntry title="Demo Videos">
                    <ModelLinksWrapper
                        model={user}
                        property="demos"
                    />
                </SummaryEntry>
                <SummaryEntry title="Status Reports">
                    {(legacyStatusReports && legacyStatusReports.length) ? (
                        <ModelLinksWrapper
                            model={user}
                            property="status_reports"
                        />
                    ) : (
                        <ul className="link-list">
                            {statusReportsItems}
                        </ul>
                    )}
                </SummaryEntry>
                <SummaryEntry title="Chat History">
                    <ChatHistory slack_username={slackUsername} />
                </SummaryEntry>
                <SummaryEntry title="Notes" className="notes-editable">
                    <Editable
                        ref={el => this.notesEl = el}
                        options={notesEditableOptions}
                        onChange={notes => user.save({ notes }, { wait: true })}
                    />
                </SummaryEntry>
                <SummaryEntry title="Review Requests">
                    <ul className="link-list">
                        {reviewRequestItems}
                    </ul>
                </SummaryEntry>
                <SummaryEntry title="Code Reviews">
                    <ul className="link-list">
                        {codeReviewItems}
                    </ul>
                </SummaryEntry>
                <SummaryEntry title="Timeline">
                    <Timeline events={this.state.events} />
                </SummaryEntry>
            </div>
        );
    }
}
