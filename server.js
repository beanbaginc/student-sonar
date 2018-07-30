const production = (process.env.NODE_ENV === 'production');

if (!production) {
    process.env.NEW_RELIC_ENABLED = 'false';
}


import 'newrelic';
import bodyParser from 'body-parser';
import connectMongo from 'connect-mongo';
import errorHandler from 'errorhandler';
import express from 'express';
import logger from 'morgan';
import passport from 'passport';
import session from 'express-session';

import routes from './lib/routes';
import init from './lib/init';


init()
    .then(options => {
        const app = express();
        app.get('*.js', (req, res, next) => {
            req.url = req.url + '.gz';
            res.set('Content-Encoding', 'gzip');
            next();
        });
        app.use('/scripts', express.static('build/scripts'));

        if (production) {
            app.use('/images', express.static('build/images'));
        } else {
            app.use('/images', express.static('images'));
            app.use(errorHandler());
        }

        const MongoStore = connectMongo(session);
        app.use(session({
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 30
            },
            store: new MongoStore({
                mongooseConnection: options.db
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
