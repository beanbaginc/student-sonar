var express = require('express'),
    logger = require('morgan'),
    Q = require('q'),
    routes = require('./lib/routes'),
    loadConfig = require('./lib/config'),
    app = express();

if (app.get('env') === 'production') {
    app.use('/scripts', express.static('build/scripts'));
    app.use('/css', express.static('build/css'));
} else {
    app.use('/lib', express.static('lib'));
    app.use('/jspm_packages', express.static('jspm_packages'));
    app.use('/style.css', express.static('style.css'));
}

loadConfig(app).then(function() {
    var port = app.get('port');

    app.use('/', routes(app));
    app.use(logger('combined'));
    app.listen(port, function() {
        console.log('Listening on port %d', port);
    });
});
