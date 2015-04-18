var errorhandler = require('errorhandler'),
    express = require('express'),
    handlebars = require('express-handlebars'),
    logger = require('morgan'),
    Q = require('q'),
    routes = require('./lib/routes'),
    loadConfig = require('./lib/config'),
    app = express();

if (app.get('env') === 'production') {
    app.use('/css', express.static('build/css'));
    app.use('/images', express.static('build/images'));
    app.use('/scripts', express.static('build/scripts'));
    app.set('views', process.cwd() + '/build/views');
} else {
    app.use('/images', express.static('images'));
    app.use('/lib', express.static('lib'));
    app.use('/jspm_packages', express.static('jspm_packages'));
    app.use('/style.css', express.static('style.css'));
}

loadConfig()
    .then(function(config) {
        app.use(logger('combined'));
        app.use(errorhandler());

        app.engine('handlebars', handlebars({
            defaultLayout: 'main'
        }));
        app.set('view engine', 'handlebars');

        app.use('/', routes(config));
        app.listen(config.port, function() {
            console.log('Listening on port %d', config.port);
        });
    })
    .catch(function(error) {
        console.error(error);
    });
