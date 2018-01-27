import express from 'express';
import moment from 'moment';
import restify from 'express-restify-mongoose';
import _ from 'underscore';

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

    function restifyDefaults(options, model) {
        return _.defaults(options, {
            lowercase: true,
            prereq: req => {
                if (!req.user) {
                    return false;
                }

                if (req.method === 'DELETE' &&
                    model.canDelete !== undefined &&
                    !model.canDelete(req.user)) {
                    return false;
                }

                if (req.method === 'POST' &&
                    model.canCreate !== undefined &&
                    !model.canCreate(req.user)) {
                    return false;
                }

                if (req.method === 'PUT' &&
                    model.canUpdate !== undefined &&
                    !model.canUpdate(req.user)) {
                    return false;
                }

                return true;
            },
            prefix: '',
            version: ''
        });
    }

    restify.serve(router, schema.User, restifyDefaults({}, schema.User));

    restify.serve(router, schema.CalendarEntry, restifyDefaults({
        contextFilter: (model, req, callback) => {
            if (req.query.limit === 'future') {
                callback(model.find({
                    date: { $gt: new Date() }
                }));
                callback(model.find().where('date').gt(new Date()));
            } else {
                callback(model);
            }
        },
        name: 'calendar-item'
    }, schema.CalendarEntry));

    restify.serve(router, schema.Group, restifyDefaults({}, schema.Group));

    restify.serve(router, schema.StatusReportDueDate, restifyDefaults({
        name: 'status-report-due-date'
    }, schema.StatusReportDueDate));

    restify.serve(router, schema.StatusReport, restifyDefaults({
        contextFilter: (model, req, callback) => {
            if (!req.user) {
                callback();
            }

            if (req.user.type === 'mentor' || req.user.type === 'instructor') {
                callback(model);
            } else {
                callback(model.find({ user: req.user._id }));
            }
        },
        middleware: (req, res, next) => {
            // Always override the user when doing a POST
            if (req.route.methods.post) {
                req.body.user = req.user.id;
            }
            next();
        },
        name: 'status-report'
    }, schema.StatusReport));

    router.get('/slack-logs/:username', (req, res) =>
        slack.getLogs(req.params.username)
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

    router.get('/student-projects', (req, res) => {
        cache.memoize(
            () => asana.getTasks(),
            'student-projects',
            { json: true })
        .then(res.json.bind(res))
        .catch(console.error.bind(console));
    });

    return router;
}
