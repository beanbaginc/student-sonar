var express = require('express'),
    moment = require('moment'),
    passport = require('passport'),
    SlackStrategy = require('passport-slack').Strategy,
    schema = require('./schema');

module.exports = function(options) {
    var config = options.config,
        slack = require('./slack')(config),
        students = require('./students')(),
        reviewboard = require('./reviewboard')(config),
        router = express.Router();

    passport.serializeUser(function(user, done) {
        done(null, user.slack_user_id);
    });
    passport.deserializeUser(function(id, done) {
        schema.User.findOne({ slack_user_id: id }, done);
    });

    passport.use(new SlackStrategy({
        clientID: config.slackClientID,
        clientSecret: config.slackClientSecret
    }, function(accessToken, refreshToken, profile, done) {
        schema.User.findOneAndUpdate(
            { slack_user_id: profile.id },
            {
                name: profile.displayName,
                slack_user_id: profile.id,
                slack_access_token: accessToken
            },
            { upsert: true },
            done);
    }));


    router.get('/', function(req, res) {
        if (req.user) {
            res.render('student-list', {
                user: req.user,
                isAdmin: req.user.groups.indexOf('mentors') !== -1
            });
        } else {
            res.render('login');
        }

    });

    router.get('/login', passport.authenticate('slack', { scope: 'identify' }));
    router.get('/login/callback', passport.authenticate('slack', {
        failureRedirect: '/login',
        failureFlash: true,
        scope: 'identify'
    }), function(req, res) {
        res.redirect('/');
    });

    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
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
