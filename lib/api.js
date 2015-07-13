let express = require('express'),
    moment = require('moment'),
    restify = require('express-restify-mongoose'),
    schema = require('./schema'),
    _ = require('lodash');

module.exports = function(options) {
    let router = express.Router(),
        reviewboard = require('./reviewboard')(options.config),
        slack = require('./slack')(options.config);

    function restifyDefaults(options, model) {
        return _.defaults(options, {
            lowercase: true,
            prereq: function(req) {
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
        contextFilter: function(model, req, callback) {
            if (req.query.limit === 'future') {
                callback(model.find().where('date').gt(new Date()));
            } else {
                callback(model);
            }
        },
        name: 'calendar-item'
    }, schema.CalenderEntry));

    restify.serve(router, schema.Group, restifyDefaults({}, schema.Group));

    router.get('/slack-logs/:username', (req, res) =>
        slack.getLogs(req.params.username)
            .then(function(logs) {
                let result = logs.Items.map(function(item) {
                    let timestamp = moment.unix(parseFloat(item.timestamp.S))
                        .startOf('day');
                    return {
                        channel_name: item.channel_name.S,
                        text: item.text.S,
                        timestamp: timestamp.unix()
                    };
                });

                res.json(result);
            })
            .catch(console.error.bind(console)));

    router.get('/review-requests/:username', (req, res) =>
        reviewboard.getReviewRequests(req.params.username)
            .then(res.json.bind(res))
            .catch(console.error.bind(console)));

    return router;
};
