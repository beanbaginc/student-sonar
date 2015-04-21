var express = require('express'),
    moment = require('moment'),
    schema = require('./schema');

module.exports = function(options) {
    var config = options.config,
        slack = require('./slack')(config),
        students = require('./students')(),
        reviewboard = require('./reviewboard')(config),
        router = express.Router();

    router.get('/', function(req, res) {
        res.render('student-list');
    });

    router.get('/students', function(req, res) {
        students.getStudents()
            .then(res.json.bind(res))
            .catch(console.error.bind(console));
    });

    router.get('/slack-logs/:username', function(req, res) {
        slack.getLogs(req.params.username)
            .then(function(logs) {
                var result = logs.Items.map(function(item) {
                    var timestamp = moment.unix(parseFloat(item.timestamp.S)).startOf('day');
                    return {
                        channel_name: item.channel_name.S,
                        text: item.text.S,
                        timestamp: timestamp.unix()
                    };
                });

                res.json(result);
            })
            .catch(console.error.bind(console));
    });

    router.get('/review-requests/:username', function(req, res) {
        reviewboard.getReviewRequests(req.params.username)
            .then(res.json.bind(res))
            .catch(console.error.bind(console));
    });

    return router;
};
