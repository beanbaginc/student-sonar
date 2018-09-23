// jshint ignore: start

import moment from 'moment';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import ReactDOM from 'react-dom';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import showdown from 'showdown';
import { Link } from 'react-router-dom';
import _ from 'underscore';

import { ALL_GROUPS_QUERY } from './api/group';
import {
    MENTORS_QUERY,
    USER_DETAIL_QUERY,
    saveUser,
} from './api/user';
import Editable from './editable';


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
        return Object.values(value).join(':');
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
                            <span className="fas fa-trash-alt"></span>
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
        this.save(links);
    }

    saveLink(index, link) {
        const links = Array.from(this.props.items);

        if (index !== null) {
            links[index] = link;
        } else {
            links.push(link);
        }

        this.save(links);
    }

    save(links) {
        this.props.onChange(links.map(link => ({
            color: link.color,
            href: link.href,
            text: link.text,
        })));
    }
}


@compose(
    graphql(ALL_GROUPS_QUERY, { name: 'groups' }),
    graphql(MENTORS_QUERY, { name: 'mentors' }),
    connect(state => ({
        manage: state.manage,
    }))
)
class UserBio extends React.Component {
    render() {
        const {
            groups: {
                loading: groupsLoading,
                groups,
            },
            mentors: {
                loading: mentorsLoading,
                users: mentors,
            },
            manage,
            user,
        } = this.props;

        if (groupsLoading || mentorsLoading) {
            return <span className="fas fa-sync fa-spin" />;
        }

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
            value: user.email,
        };

        // primary mentor editor
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
            value: user.primary_mentor,
        };

        const initialMentorValue = mentors.find(i => i.id === user.primary_mentor);

        // rb username editor
        const rbUsernameEditableOptions = {
            disabled: !manage,
            mode: 'inline',
            type: 'text',
            unsavedclass: null,
            value: user.rb_username,
        };

        // groups editor
        const groupsEditableOptions = {
            disabled: !manage,
            mode: 'inline',
            type: 'selectize',
            selectize: {
                create: true,
                delimiter: ',',
                options: groups.map(group => ({
                    text: group.group_id,
                    value: group.group_id,
                })),
                plugins: ['remove_button'],
            },
            unsavedclass: null,
            display: function(value) {
                if (typeof value === 'function') {
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
            value: () => user.groups.join(','),
        };


        return (
            <React.Fragment>
                <div className="bio">
                    <img className="avatar" src={user.avatar} alt="" />
                    <div className="bio-entry"><span id="name">{user.name}</span></div>
                    <div className="bio-entry">
                        <Editable
                            options={schoolEditableOptions}
                            onChange={school => this.props.save({ school })}>
                            {user.school}
                        </Editable>
                    </div>
                    <div className="bio-entry">
                        <Editable
                            options={emailEditableOptions}
                            onChange={email => this.props.save({ email })}
                        />
                    </div>
                    <div className="bio-entry">
                        <Editable
                            options={mentorEditableOptions}
                            onChange={primary_mentor => this.props.save({ primary_mentor })}
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
                                    onChange={groups => this.props.save({ groups: groups.split(',') })}
                                />
                            </dd>

                            <dt>RB username:</dt>
                            <dd>
                                <Editable
                                    options={rbUsernameEditableOptions}
                                    onChange={rb_username => this.props.save({ rb_username })}
                                />
                            </dd>

                            <dt>Slack username:</dt>
                            <dd>{user.slack_username}</dd>

                            <dt>Timezone:</dt>
                            <dd>{user.timezone}</dd>
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
                                {event.iconFAClass && <span className={`fas ${event.iconFAClass}`}></span>}
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


const SummaryEntry = props => (
    <div className={`summary-entry ${props.className || ''}`}>
        <div className="summary-entry-title">{props.title}</div>
        <div className="summary-entry-content">{props.children}</div>
    </div>
);


class ChatHistory extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            months: [],
            max: 0,
        };
    }

    componentDidMount() {
        this.update();
    }

    update() {
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

                const today = moment();
                const date = moment().startOf('month').subtract(11, 'months');
                const months = [];

                for (let i = 0; i < 12; i++) {
                    const month = {
                        days: [],
                        name: date.format('MMMM'),
                    };

                    let week = -1;
                    let currentMonth = date.month();

                    while (date.month() === currentMonth) {
                        const dayOfWeek = date.day();
                        const count = data[date.unix().toString()] || 0;

                        if (dayOfWeek === 0 || week === -1) {
                            week++;
                        }

                        const title = (count
                            ? `${count} items on ${date.format('LL')}`
                            : date.format('LL'));

                        month.days.push({
                            week: week,
                            day: dayOfWeek,
                            count: count,
                            title: title,
                            today: date.isSame(today, 'day'),
                        });

                        date.add(1, 'day');
                    }

                    month.totalWeeks = week + 1;

                    months.push(month);
                }

                const max = Math.max(
                    Math.max.apply(Math, Object.values(data)),
                    30);

                this.setState({
                    months,
                    max,
                });
            });
    }

    render() {
        const { months, max } = this.state;

        let x = 0;

        const monthEntries = months.map((month, i) => {
            const width = (month.totalWeeks * 10) + ((month.totalWeeks - 1) * 2);

            const days = month.days.map((day, j) => {
                const valueClasses = ['', 'q1', 'q2', 'q3', 'q4', 'q5'];

                const valueClass = valueClasses[
                    Math.ceil((Math.min(day.count, max) / max) *
                              (valueClasses.length - 1))];
                const highlightClass = day.today ? 'highlight-now now' : '';
                const rectClass = `graph-rect ${valueClass} ${highlightClass}`;

                return (
                    <g key={`${i}-${j}`}>
                        <rect
                            className={rectClass}
                            x={day.week * 12}
                            y={day.day * 12}
                            width="10"
                            height="10">
                            <title>{day.title}</title>
                        </rect>
                    </g>
                );
            });

            const entry = (
                <svg key={i} width={width + 4} height="111" x={x} y="0" className="graph-domain">
                    <rect
                        width={width}
                        height="107"
                        className="domain-background"
                    />
                    <svg x="0" y="0" className="graph-subdomain-group">
                        {days}
                    </svg>
                    <text
                        className="graph-label"
                        x={width / 2}
                        y="96.5"
                        textAnchor="middle"
                        dominantBaseline="middle">
                        {month.name}
                    </text>
                </svg>
            );

            x += width + 8;

            return entry;
        });

        return (
            <svg className="cal-heatmap-container" x="0" y="0" width={x} height="107">
                {monthEntries}
            </svg>
        );
    }
}


@compose(
    saveUser,
    graphql(USER_DETAIL_QUERY, {
        options: props => ({
            variables: {
                slack_username: props.match.params.userId,
            },
        }),
    }),
    connect(state => ({
        manage: state.manage,
    }))
)
export default class UserDetail extends React.Component {
    rbLogoURL = '/images/reviewboard-logo.png';

    constructor(props) {
        super(props);

        this.save = this.save.bind(this);
        this.update = this.update.bind(this);

        this.events = [];
        this.state = {
            codeReviews: null,
            events: [],
            reviewRequests: null,
        };
    }

    save(newAttrs) {
        const variables = Object.assign({}, this.props.data.user, newAttrs);

        // Filter out unexpected things from the links list.
        variables.demos = variables.demos.map(demo => ({
            color: demo.color,
            href: demo.href,
            text: demo.text,
        }));

        this.props.mutate({ variables });
    }


    componentDidMount() {
        this.update();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data.user !== this.props.data.user) {
            this.update();
        }
    }

    update() {
        this.setState({
            codeReviews: null,
            events: [],
            reviewRequests: null,
        });

        if (this.props.data.user) {
            this.events = [];
            this.updateCodeReviews();
            this.updateReviewRequests();
        }
    }

    updateCodeReviews() {
        fetch(`/api/reviews/${this.props.data.user.rb_username}`)
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

    updateReviewRequests() {
        fetch(`/api/review-requests/${this.props.data.user.rb_username}`)
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

    render() {
        const {
            data: {
                loading,
                error,
                user,
            },
            manage,
        } = this.props;
        const {
            codeReviews,
            reviewRequests,
        } = this.state;

        if (loading) {
            return <div className="spinner"><span className="fas fa-sync fa-spin" /></div>;
        }

        const events = user.status_reports.map(report => {
            const due = moment(report.date_due.date);
            const submitted = report.date_submitted ? moment(report.date_submitted) : due;

            return {
                date: submitted,
                iconFAClass: 'fa-list-ul',
                linkURL: `/status/view/${report.id}`,
                summary: due < submitted
                    ? `Status Report (was due ${due.format('ddd, MMM D')})`
                    : 'Status Report',
            };
        });

        let statusReportsItems;

        if (user.status_report_due_dates && user.status_report_due_dates.length) {
            const today = moment().endOf('day');

            // New-style status reports.
            statusReportsItems = user.status_report_due_dates.map(dueDate => {
                const report = user.status_reports.find(r => r.date_due.id === dueDate.id);
                const due = moment(dueDate.date);
                let content;

                if (report) {
                    console.log('due %s, submitted %s', dueDate.date, report.date_submitted);
                    const late = due.isBefore(report.date_submitted);
                    content = (
                        <Link to={`/status/view/${report.id}`}>
                            {due.format('YYYY-MM-DD')}
                            {late && <span className="text-warning"> (late)</span>}
                        </Link>
                    );
                } else if (due.isBefore(today)) {
                    content = (
                        <span>
                            {due.format('YYYY-MM-DD')}
                            <span className="text-danger"> (missing)</span>
                        </span>
                    );
                } else {
                    content = <span>{due.format('YYYY-MM-DD')}</span>;
                }

                return <li key={dueDate.id}>{content}</li>;
            });
        } else {
            // Old-style status reports.
            statusReportsItems = user.status_reports
                .map(report => Object.assign({}, report, {
                    due: moment(report.date_due.date),
                }))
                .sort((a, b) => a.due.diff(b.due))
                .map(report => (
                    <li key={report.id}>
                        <a href={report.href}>{moment(report.date_due.date).format('YYYY-MM-DD')}</a>
                    </li>
                ));
        }

        const reviewRequestItems = reviewRequests === null
            ? <span className="fas fa-sync fa-spin" />
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
            ? <span className="fas fa-sync fa-spin" />
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
            value: user.notes,
            unsavedclass: null,
        };

        return (
            <div className="user-detail">
                <Helmet>
                    <title>{user.name} - Student Sonar</title>
                </Helmet>
                <UserBio user={user} save={this.save} />
                <SummaryEntry title="Projects">
                    <ul className="link-list">
                        {user.projects.map(project => (
                            <li key={project.id}>
                                {project.href ? (
                                    <a href={project.href}>{project.name}</a>
                                ) : (
                                    <Link to={`/projects/${project.id}`}>
                                        {project.completed && <span style={{color: 'green'}}>[Completed] </span>}
                                        {project.name}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </SummaryEntry>
                <SummaryEntry title="Demo Videos">
                    <Links
                        items={user.demos}
                        onChange={demos => this.save({ demos })}
                        manage={manage}
                    />
                </SummaryEntry>
                <SummaryEntry title="Status Reports">
                    <ul className="link-list">
                        {statusReportsItems}
                    </ul>
                </SummaryEntry>
                <SummaryEntry title="Chat History">
                    <ChatHistory slack_username={user.slack_username} />
                </SummaryEntry>
                <SummaryEntry title="Notes" className="notes-editable">
                    <Editable
                        ref={el => this.notesEl = el}
                        options={notesEditableOptions}
                        onChange={notes => this.save({ notes })}
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
                    <Timeline events={[].concat(events, this.state.events)} />
                </SummaryEntry>
            </div>
        );
    }
}
