import express from 'express';
import graphql from 'express-graphql';
import ical from 'ical';
import { buildSchema } from 'graphql';
import { importSchema } from 'graphql-import';
import { makeExecutableSchema } from 'graphql-tools';
import moment from 'moment';
import mongoose from 'mongoose';
import fetch from 'node-fetch';

import schema from './schema';
import Asana from './asana';
import ReviewBoard from './reviewboard';
import Slack from './slack';
import Cache from './cache';


export default function(options) {
    const router = express.Router();
    const asana = new Asana(options.config);
    const reviewboard = new ReviewBoard(options.config);
    const slack = new Slack(options.config);
    const cache = new Cache(options.config);

    router.get('/slack-logs/:username', (req, res) =>
        schema.User.findOne({ slack_username: req.params.username })
            .then(user => slack.getLogs(user.slack_user_id))
            .then(logs => {
                const result = logs.Items.map(item => {
                    const timestamp = moment.unix(parseFloat(item.timestamp.S)).startOf('day');

                    return {
                        channel_name: item.channel_name.S,
                        text: item.text && item.text.S,
                        timestamp: timestamp.unix(),
                    };
                });

                res.json(result);
            })
            .catch(console.error.bind(console)));

    router.get('/review-requests/:username', (req, res) =>
        reviewboard.getReviewRequests(req.params.username)
            .then(res.json.bind(res))
            .catch(console.error.bind(console)));

    router.get('/reviews/:username', (req, res) =>
        reviewboard.getReviews(req.params.username)
            .then(res.json.bind(res))
            .catch(console.error.bind(console)));

    const typeDefs = importSchema('lib/graphql/schema.graphql');
    const resolvers = {
        Query: {
            calendar: () => ({
                subscribe_url: options.config.calendarURL,
            }),
            groups: (obj, args) => {
                const query = {};

                if (args.active) {
                    query.show_in_sidebar = true;
                }

                return schema.Group.find(query, null, { sort: 'group_id' });
            },
            project: (obj, args) => asana.getTaskByID(args.id),
            projects: () => cache.memoize(asana.getTasks, 'project-ideas', { json: true }),
            status_report: (obj, args) => {
                if (args.id) {
                    return schema.StatusReport.findById(args.id);
                    query._id = id;
                } else if (args.date_due && args.user) {
                    return schema.StatusReport
                        .findOne({
                            date_due: args.date_due,
                            user: args.user,
                        })
                        .then(statusReport => {
                            if (statusReport === null) {
                                return {
                                    date_due: new mongoose.mongo.ObjectID(args.date_due),
                                    id: null,
                                    text: null,
                                    user: args.user,
                                }
                            } else {
                                return statusReport;
                            }
                        });
                } else {
                    throw new Error('Invalid status report query.');
                }
            },
            status_report_due_dates: (obj, args) => {
                if (args.active) {
                    return schema.Group.find({ show: true })
                        .then(groups => groups.map(group => group.group_id))
                        .then(groups => schema.StatusReportDueDate.find(
                            { show_to_groups: { $in: groups } },
                            null,
                            { sort: 'date' }));
                } else {
                    return schema.StatusReportDueDate.find({}, null, { sort: 'date' });
                }
            },
            user: (obj, args) => {
                const query = {};

                if (args.id) {
                    query._id = args.id;
                }

                if (args.slack_username) {
                    query.slack_username = args.slack_username;
                }

                return schema.User.findOne(query);
            },
            users: (obj, args) => {
                const query = {};

                if (args.is_mentor) {
                    query.type = 'mentor';
                }

                if (args.active) {
                    return schema.Group.find({ show: true })
                        .then(groups => groups.map(group => group.group_id))
                        .then(groups => {
                            query.groups = { $in: groups };
                            return schema.User.find(query, null, { sort: 'name' });
                        });
                } else {
                    return schema.User.find(query, null, { sort: 'name' });
                }
            },
        },
        Mutation: {
            saveStatusReport: (root, { date_due, id, text, user }, context) => {
                if (!context.user ||
                    context.user._id.toString() !== user) {
                    throw new Error('Permission denied.');
                }

                const data = { text };

                if (id === null) {
                    data['_id'] = new mongoose.mongo.ObjectID();
                }

                return schema.StatusReport.findOneAndUpdate(
                    { date_due, user },
                    data,
                    { upsert: true, new: true });
            },
            deleteStatusReportDueDate: (root, { id }, context) => {
                if (!context.isMentor) {
                    throw new Error('Permission denied.');
                }

                return schema.StatusReportDueDate
                    .deleteOne({ _id: id })
                    .then(() => id);
            },
            saveStatusReportDueDate: (root, obj, context) => {
                if (!context.isMentor) {
                    throw new Error('Permission denied.');
                }

                let { id, ...data } = obj;

                if (id === null) {
                    id = new mongoose.mongo.ObjectID();
                }

                return schema.StatusReportDueDate.findByIdAndUpdate(
                    id, data,
                    { upsert: true, new: true });
            },
            saveUser: (root, obj, context) => {
                const { id, ...data } = obj;
                return schema.User.findByIdAndUpdate(id, data, { new: true });
            },
        },
        Calendar: {
            // TODO: cache this
            items: obj => fetch(obj.subscribe_url)
                .then(rsp => rsp.text())
                .then(data => ical.parseICS(data))
                .then(data => {
                    const items = [];
                    const now = moment();

                    for (let [id, item] of Object.entries(data)) {
                        if (item.type !== 'VEVENT') {
                            continue;
                        }

                        const start = moment(item.start);

                        if (start < now) {
                            continue;
                        }

                        const end = moment(item.end);

                        items.push({
                            all_day: (start.diff(end) % 86400000) === 0,
                            end: end,
                            id: id,
                            start: start,
                            title: item.summary,
                        });
                    }

                    return items.sort((a, b) => a.start.diff(b.start));
                }),
        },
        CalendarItem: {
            start: obj => obj.start.toISOString(),
            end: obj => obj.end.toISOString(),
        },
        Group: {
            users: obj => schema.User.find({ groups: obj.group_id }, null, { sort: 'name' }),
        },
        Project: {
            section: obj => obj.section || '',
            user: obj => {
                return obj.assignee
                    ? schema.User.findOne({ email: obj.assignee })
                    : null;
            },
        },
        StatusReport: {
            date_due: obj => {
                if (obj.date_due._bsontype === 'ObjectID') {
                    return schema.StatusReportDueDate.findById(obj.date_due);
                } else {
                    // Data from old-style status report shim.
                    return obj.date_due;
                }
            },
            date_submitted: obj => obj.date_submitted && obj.date_submitted.toISOString(),
            user: obj => schema.User.findById(obj.user),
        },
        StatusReportDueDate: {
            date: obj => obj.date.toISOString(),
        },
        User: {
            groups: obj => obj.groups || [],
            notes: (obj, args, context) => context.isMentor ? obj.notes : null,
            projects: obj => {
                if (obj.projects.length) {
                    // Old-style project list.
                    return obj.projects.map(project => ({
                        id: project._id,
                        href: project.href,
                        name: project.text,
                    }))
                } else if (obj.email) {
                    return cache.memoize(asana.getTasks, 'project-ideas', { json: true })
                        .then(tasks => tasks.filter(task => task.assignee === obj.email));
                } else {
                    return null;
                }
            },
            status_reports: obj => {
                if (obj.status_reports && obj.status_reports.length) {
                    // Old-style status reports.
                    return obj.status_reports.map(report => ({
                        date_due: {
                            id: new mongoose.mongo.ObjectID(),
                            date: moment(report.text, 'D MMM YYYY'),
                            show_to_groups: [],
                        },
                        date_submitted: null,
                        id: new mongoose.mongo.ObjectID(),
                        href: report.href,
                        text: null,
                        user: obj,
                    }));
                } else {
                    return schema.StatusReport.find(
                        { user: obj._id },
                        null,
                        { sort: 'date_due' });
                }
            },
            status_report_due_dates: obj => schema.StatusReportDueDate.find(
                { show_to_groups: { $in: obj.groups } },
                null,
                { sort: 'date' }),
        },
    };

    router.use('/graphql', graphql(request => ({
        schema: makeExecutableSchema({ typeDefs, resolvers }),
        graphiql: true,
        context: {
            user: request.user,
            isMentor: request.user && request.user.type === 'mentor',
        },
        formatError: e => {
            console.error(e);
            return {
                message: e.message,
                code: e.originalError && e.originalError.code,
                locations: e.locations,
                path: e.path,
            };
        },
    })));

    return router;
}
