let express = require('express'),
    passport = require('passport'),
    schema = require('./schema');

module.exports = function(options) {
    passport.serializeUser(function(user, done) {
        done(null, user.slack_user_id);
    });
    passport.deserializeUser(function(id, done) {
        schema.User.findOne({ slack_user_id: id }, done);
    });

    let SlackStrategy = require('passport-slack').Strategy;
    passport.use(new SlackStrategy({
        clientID: options.config.slackClientID,
        clientSecret: options.config.slackClientSecret
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

    let router = express.Router();

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

    router.use('/api', require('./api')(options));

    router.get('*', function(req, res) {
        if (req.user) {
            res.render('student-list', {
                userId: req.user.id,
                isAdmin: req.user.isAdmin()
            });
        } else {
            res.render('login');
        }

    });

    return router;
};
