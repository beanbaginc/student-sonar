let bodyParser = require('body-parser'),
    errorhandler = require('errorhandler'),
    express = require('express'),
    handlebars = require('express-handlebars'),
    logger = require('morgan'),
    passport = require('passport'),
    Q = require('q'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    routes = require('./lib/routes'),
    init = require('./lib/init');

init()
    .then(function(options) {
        let handlebarsOptions = {
            defaultLayout: 'main',
            compilerOptions: {}
        };

        let app = express();

        if (app.get('env') === 'production') {
            app.use('/css', express.static('build/css'));
            app.use('/images', express.static('build/images'));
            app.use('/scripts', express.static('build/scripts'));

            let viewsDir = process.cwd() + '/build/views';
            app.set('views', viewsDir);

            handlebarsOptions.layoutsDir = viewsDir + '/layouts';
            handlebarsOptions.partialsDir = viewsDir + '/partials';
        } else {
            app.use('/css', express.static('css'));
            app.use('/images', express.static('images'));
            app.use('/lib', express.static('lib'));
            app.use('/jspm_packages', express.static('jspm_packages'));

            app.use(errorhandler());
        }

        app.use(session({
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

        app.engine('handlebars', handlebars(handlebarsOptions));
        app.set('view engine', 'handlebars');

        app.use('/', routes(options));

        let port = options.config.port;
        app.listen(port, function() {
            console.log('Listening on port %d', port);
        });
    })
    .catch(console.error.bind(console));
