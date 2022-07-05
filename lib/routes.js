import express from 'express';
import passport from 'passport';
import passportSlack from 'passport-slack';

import api from './api';
import schema from './schema';


export default function(options) {
    passport.serializeUser((user, done) => done(null, user.slackUserId));
    passport.deserializeUser(async (id, done) => {
        const user = await schema.sql.User.findOne({
            where: {
                slackUserId: id,
            },
        });
        done(null, user);
    });

    passport.use(new passportSlack.Strategy({
        clientID: options.config.slackClientID,
        clientSecret: options.config.slackClientSecret
    }, async (accessToken, refreshToken, profile, done) => {
        const [user, updated] = await schema.sql.User.upsert({
            slackUserId: profile.id,
            slackAccessToken: accessToken,
        });
        done(null, user);
    }));

    const router = express.Router();

    router.get('/login', passport.authenticate('slack', { scope: 'identify' }));
    router.get(
        '/login/callback',
        passport.authenticate('slack', {
            failureRedirect: '/login',
            failureFlash: true,
            scope: 'identify',
        }),
        (req, res) => res.redirect('/'));

    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    router.use('/api', api(options));

    router.get(`/.well-known/acme-challenge/${options.config.letsEncryptChallengeKey}`,
               (req, res) => res.send(options.config.letsEncryptChallengeResponse));

    router.get('*', (req, res) => {
        const opts = {};

        if (req.user) {
            opts.userId = `'${req.user.slackUserId}'`;
            opts.userType = `'${req.user.type}'`;
        } else {
            opts.userId = 'null';
            opts.userType = `'anonymous'`;
        }

        res.send(dedent`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Student Sonar</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <meta charset="utf-8" />
                    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" crossorigin="anonymous">
                </head>
                <body>
                    <div class="root"></div>
                    <script>
                        window.userId = ${opts.userId};
                        window.userType = ${opts.userType};
                        window.sentryDsn = '${options.config.sentryDsn}';
                    </script>
                    <script src="/scripts/bundle.js"></script>
                </body>
            </html>
        `);
    });

    return router;
}
