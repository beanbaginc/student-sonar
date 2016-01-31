const express = require('express'),
      passport = require('passport'),
      passport_slack = require('passport-slack');

const schema = require('./schema');

module.exports = function(options) {
    passport.serializeUser(function(user, done) {
        done(null, user.slack_user_id);
    });
    passport.deserializeUser(function(id, done) {
        schema.User.findOne({ slack_user_id: id }, done);
    });

    passport.use(new passport_slack.Strategy({
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

    const router = express.Router();

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
        const opts = {};

        if (req.user) {
            opts.userId = `'${req.user.id}'`;
            opts.userType = `'${req.user.type}'`;
        } else {
            opts.userId = 'null';
            opts.userType = `'anonymous'`;
        }

        res.render('main', opts);
    });

    return router;
};
