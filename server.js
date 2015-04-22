var errorhandler = require('errorhandler'),
    express = require('express'),
    handlebars = require('express-handlebars'),
    logger = require('morgan'),
    Q = require('q'),
    routes = require('./lib/routes'),
    init = require('./lib/init'),
    app = express();

init()
    .then(function(options) {
        var port = options.config.port,
            handlebarsOptions = {
                defaultLayout: 'main',
                compilerOptions: {}
            },
            viewsDir;

        if (app.get('env') === 'production') {
            app.use('/css', express.static('build/css'));
            app.use('/images', express.static('build/images'));
            app.use('/scripts', express.static('build/scripts'));

            viewsDir = process.cwd() + '/build/views';
            app.set('views', viewsDir);

            handlebarsOptions.layoutsDir = viewsDir + '/layouts';
            handlebarsOptions.partialsDir = viewsDir + '/partials';
        } else {
            app.use('/images', express.static('images'));
            app.use('/lib', express.static('lib'));
            app.use('/jspm_packages', express.static('jspm_packages'));
            app.use('/style.css', express.static('style.css'));
        }

        app.use(logger('combined'));
        app.use(errorhandler());

        app.engine('handlebars', handlebars(handlebarsOptions));
        app.set('view engine', 'handlebars');

        app.use('/', routes(options));

        app.listen(port, function() {
            console.log('Listening on port %d', port);
        });
    })
    .catch(console.error.bind(console));
