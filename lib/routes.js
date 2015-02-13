var express = require('express'),
    moment = require('moment');

module.exports = function(app) {
    var slack = require('./slack')(app),
        students = require('./students')(app),
        reviewboard = require('./reviewboard')(app),
        router = express.Router();

    router.get('/', function(req, res) {
        var root = __dirname + '/../';

        if (app.get('env') === 'production') {
            root += 'build/';
        }

        res.sendFile('index.html', { root: root });
    });

    router.get('/students', function(req, res) {
        students.getStudents()
            .then(function(term) {
                res.json(term);
            })
            .catch(function(error) {
                console.error(error);
            });
    });

    router.get('/slack-logs/:username', function(req, res) {
        slack.getLogs(req.params.username)
            .then(function(logs) {
                var result = [],
                    data = {},
                    timestamp,
                    i,
                    item;

                for (i = 0; i < logs.Items.length; i++) {
                    item = logs.Items[i];
                    timestamp = moment.unix(parseFloat(item.timestamp.S)).startOf('day');

                    result.push({
                        channel_name: item.channel_name.S,
                        text: item.text.S,
                        timestamp: timestamp.unix()
                    });
                }

                res.json(result);
            })
            .catch(function(error) {
                console.error(error);
            });
    });

    router.get('/review-requests/:username', function(req, res) {
        reviewboard.getReviewRequests(req.params.username)
            .then(function(reviewRequests) {
                res.json(reviewRequests);
            })
            .catch(function(error) {
                console.error(error);
            });
    });

    return router;
};
