const production = (process.env.NODE_ENV === 'production');

if (!production) {
    process.env.NEW_RELIC_ENABLED = 'false';
}


import bodyParser from 'body-parser';
import errorHandler from 'errorhandler';
import express from 'express';
import logger from 'morgan';
import passport from 'passport';
import session from 'express-session';
import sessionStore from 'express-session-sequelize';
import expressStaticGzip from 'express-static-gzip';
import * as Sentry from '@sentry/node';

import routes from './lib/routes.js';
import init from './lib/init.js';


init()
.then(options => {
    const app = express();

    Sentry.init({
        dsn: options.config.sentryDsnBackend,
    });

    app.use(Sentry.Handlers.errorHandler());
    app.use(function onError(err, req, res, next) {
        // The error id is attached to `res.sentry` to be returned
        // and optionally displayed to the user for support.
        res.statusCode = 500;
        res.end(res.sentry + '\n');
    });

    app.use('/scripts', expressStaticGzip('build/scripts', {
        enableBrotli: true,
    }));

    if (production) {
        app.use('/images', express.static('build/images'));
    } else {
        app.use('/images', express.static('images'));
        app.use(errorHandler());
    }

    const SessionStore = sessionStore(session.Store);
    app.use(session({
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 30
        },
        store: new SessionStore({
            db: options.sequelize,
        }),
        resave: false,
        saveUninitialized: true,
        secret: options.config.sessionSecret
    }));

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(logger('combined'));

    app.use('/', routes(options));

    const port = options.config.port;
    app.listen(port, () => console.log('Listening on port %d', port));
})
.catch(console.error.bind(console));
