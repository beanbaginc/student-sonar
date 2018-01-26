const production = (process.env.NODE_ENV === 'production');

if (production) {
    require('newrelic');
}


const bodyParser = require('body-parser'),
      errorhandler = require('errorhandler'),
      express = require('express'),
      logger = require('morgan'),
      passport = require('passport'),
      Q = require('q'),
      session = require('express-session'),
      MongoStore = require('connect-mongo')(session),
      routes = require('./lib/routes'),
      init = require('./lib/init');

init()
    .then(function(options) {
        let app = express();
        app.use('/scripts', express.static('build/scripts'));

        if (production) {
            app.use('/images', express.static('build/images'));
        } else {
            app.use('/images', express.static('images'));
            app.use(errorhandler());
        }

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

        let port = options.config.port;
        app.listen(port, function() {
            console.log('Listening on port %d', port);
        });
    })
    .catch(console.error.bind(console));
