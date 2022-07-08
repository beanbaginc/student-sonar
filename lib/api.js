import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import ical from 'ical';
import { buildSchema } from 'graphql';
import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { addResolversToSchema } from '@graphql-tools/schema'
import moment from 'moment';
import fetch from 'node-fetch';
import path from 'path';
import Sequelize from 'sequelize';
import { fileURLToPath } from 'url';

import schema from './schema.js';
import Asana from './asana.js';
import ReviewBoard from './reviewboard.js';
import Slack from './slack.js';
import Cache from './cache.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function isMentor(context) {
    return context.user && context.user.type === 'mentor';
}


export default function(options) {
    const router = express.Router();
    const asana = new Asana(options.config);
    const reviewboard = new ReviewBoard(options.config);
    const slack = new Slack(options.config);
    const cache = new Cache(options.config);

    router.get('/slack-logs/:username', (req, res) =>
        schema.sql.User.findOne(
            {
                where: {
                    slackUsername: req.params.username,
                },
            })
            .then(user => {
                return slack.getLogs(user.slackUserId);
            })
            .then(logs => {
                const result = logs.Items.map(item => {
                    const timestamp = moment.unix(parseFloat(item.timestamp.S));

                    return {
                        channel_name: item.channel_name.S,
                        text: item.text && item.text.S,
                        timestamp: timestamp.format('LL'),
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

    const graphQLSchema = loadSchemaSync(
        path.join(__dirname, 'graphql/schema.graphql'),
        { loaders: [new GraphQLFileLoader()] });
    const resolvers = {
        Query: {
            calendar: () => ({
                subscribeURL: options.config.calendarURL,
            }),
            groups: (obj, args) => {
                const where = {};

                if (args.active) {
                    where.showInSidebar = true;
                }

                return schema.sql.Group.findAll({
                    where: where,
                    order: [
                        ['groupId', 'ASC'],
                    ],
                });
            },
            project: (obj, args) => asana.getTaskByID(args.id),
            projects: () => cache.memoize(asana.getTasks, 'project-ideas', { json: true }),
            statusReport: async (obj, args) => {
                if (args.id) {
                    return schema.sql.StatusReport.findByPk(parseInt(args.id, 10))
                } else if (args.dateDue && args.user) {
                    const [report, created] = await schema.sql.StatusReport.findOrCreate({
                        where: {
                            StatusReportDueDateId: args.dateDue,
                            UserSlackUserId: args.user,
                        },
                    });
                    return report;
                } else {
                    throw new Error('Invalid status report query.');
                }
            },
            statusReportDueDates: (obj, args) => {
                if (args.active) {
                    return schema.sql.StatusReportDueDate.findAll({
                        where: {
                            '$Groups.active$': true,
                        },
                        include: [
                            {
                                    model: schema.sql.Group,
                                    as: 'Groups',
                            },
                        ],
                        order: [
                            ['date', 'ASC'],
                        ],
                    });
                } else {
                    return schema.sql.StatusReportDueDate.findAll({
                        order: [
                            ['date', 'ASC'],
                        ],
                    });
                }
            },
            user: (obj, args) => {
                if (args.id) {
                    return schema.sql.User.findByPk(args.id);
                } else if (args.slackUsername) {
                    return schema.sql.User.findOne({
                        where: {
                            slackUsername: args.slackUsername,
                        },
                    });
                } else {
                    return null;
                }
            },
            users: (obj, args) => {
                const where = {};

                if (args.isMentor) {
                    where.type = 'mentor';
                }

                if (args.active) {
                    return schema.sql.User.findAll({
                        where: {
                            '$Groups.active$': true,
                        },
                        include: [
                            {
                                model: schema.sql.Group,
                                as: 'Groups',
                            },
                        ],
                    });
                } else {
                    return schema.sql.User.findAll({
                        where: where,
                        order: [
                            ['name', 'ASC'],
                        ],
                    });
                }
            },
        },
        Mutation: {
            deleteGroup: async (root, { id }, context) => {
                if (!isMentor(context)) {
                    throw new Error('Permission denied.');
                }

                await schema.sql.Group.destroy({
                    where: {
                        id: id,
                    },
                });

                return id;
            },
            saveGroup: async (root, obj, context) => {
                if (!isMentor(context)) {
                    throw new Error('Permission denied.');
                }

                const { id, ...data } = obj;
                let group;

                if (id === null) {
                    group = await schema.sql.Group.create(data);
                } else {
                    const [updated, groups] = await schema.sql.Group.update(data, {
                        where: {
                            id: id,
                        },
                        returning: true,
                    });
                    console.assert(updated === 1);
                    group = groups[0];
                }

                return group;
            },
            saveStatusReport: async (root, { dateDue, id, text, user }, context) => {
                if (!context.user || context.user.slackUserId !== user) {
                    throw new Error('Permission denied.');
                }

                const data = {
                    text,
                    dateSubmitted: Date.now(),
                    StatusReportDueDateId: dateDue,
                    UserId: user,
                };

                if (id === null) {
                    return schema.sql.StatusReport.create(data);
                } else {
                    const [updated, rows] = await schema.sql.StatusReport.update(
                        data,
                        {
                            where: {
                                id: id,
                            },
                            returning: true,
                        });

                    if (updated !== 1) {
                        console.error('Attempted to update StatusReport %d and updated %d rows',
                                      id, updated);
                        throw new Error('Failed to save Status Report');
                    }

                    return rows[0];
                }
            },
            deleteStatusReportDueDate: async (root, { id }, context) => {
                if (!isMentor(context)) {
                    throw new Error('Permission denied.');
                }

                await schema.sql.StatusReportDueDate.destroy({
                    where: {
                        id: id,
                    },
                });

                return id;
            },
            saveStatusReportDueDate: async (root, obj, context) => {
                if (!isMentor(context)) {
                    throw new Error('Permission denied.');
                }

                let { id, date, showToGroups } = obj;
                let dueDate;

                if (id === null) {
                    dueDate = await schema.sql.StatusReportDueDate.create({
                        date: new Date(date)
                    });
                } else {
                    dueDate = await schema.sql.StatusReportDueDate.findByPk(parseInt(id, 10));
                    await dueDate.update({
                        date: new Date(date),
                    });
                }

                const groups = await schema.sql.Group.findAll({
                    where: {
                        groupId: showToGroups,
                    },
                });
                await dueDate.setGroups(groups);

                return dueDate;
            },
            saveUser: async (root, obj, context) => {
                const { id, groups: groupIds, ...data } = obj;
                const [updated, users] = await schema.sql.User.update({ ...data }, {
                    where: {
                        slackUserId: id,
                    },
                    returning: true,
                });

                console.assert(updated === 1);
                const user = users[0];

                const groups = await schema.sql.Group.findAll({
                    where: {
                        groupId: groupIds,
                    },
                });
                await user.setGroups(groups);

                return user;
            },
        },
        Calendar: {
            // TODO: cache this
            items: obj => fetch(obj.subscribeURL)
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
                            allDay: (start.diff(end) % 86400000) === 0,
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
            users: obj => obj.getUsers({
                order: [
                    ['name', 'ASC'],
                ],
            })
        },
        Project: {
            section: obj => obj.section || '',
            user: obj => obj.assignee
                ? schema.sql.User.findOne({
                    where: {
                        email: obj.assignee,
                    },
                })
                : null,
        },
        StatusReport: {
            dateDue: obj => obj.getStatusReportDueDate(),
            user: obj => obj.getUser(),
        },
        StatusReportDueDate: {
            showToGroups: async obj => {
                const groups = await obj.getGroups();
                return groups.map(group => group.groupId);
            },
        },
        User: {
            assignedMentor: obj => obj.assignedMentor,
            demos: obj => obj.demos || [],
            groups: async obj => {
                const groups = await obj.getGroups();
                return groups.map(group => group.groupId);
            },
            id: obj => obj.slackUserId,
            notes: (obj, args, context) => isMentor(context) ? obj.notes : null,
            projects: obj => {
                if (obj.legacyProjects) {
                    // Old-style project list.
                    return obj.legacyProjects.map(project => ({
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
            slackUsername: obj => obj.slackUsername,
            statusReports: obj => {
                if (obj.legacyStatusReports && obj.legacyStatusReports.length) {
                    // Old-style status reports.
                    // TODO (do we care?)
                    return [];
                } else {
                    return obj.getStatusReports({
                        include: [
                            {
                                model: schema.sql.StatusReportDueDate,
                                as: 'StatusReportDueDate',
                            },
                        ],
                        order: [
                            [Sequelize.literal('"StatusReportDueDate.date"'), 'ASC'],
                        ],
                    });
                }
            },
            statusReportDueDates: async obj => {
                const groups = await obj.getGroups();
                return await schema.sql.StatusReportDueDate.findAll({
                    where: {
                        '$Groups.id$': groups.map(group => group.id),
                    },
                    include: [
                        {
                            model: schema.sql.Group,
                            as: 'Groups',
                        },
                    ],
                    order: [
                        ['date', 'ASC'],
                    ],
                });
            },
        },
    };

    router.use('/graphql', graphqlHTTP({
        schema: addResolversToSchema({ schema: graphQLSchema, resolvers }),
        graphiql: true,
        customFormatErrorFn: e => {
            console.error(e);
            return {
                message: e.message,
                code: e.originalError && e.originalError.code,
                locations: e.locations,
                path: e.path,
            };
        },
    }));

    return router;
}
