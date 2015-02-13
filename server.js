var express = require('express'),
    logger = require('morgan'),
    config = require('./config'),
    routes = require('./lib/routes')(config),
    server = express(),
    staticPaths = [
        'lib',
        'jspm_packages',
        'style.css'
    ],
    i;

server.use(logger('combined'));
for (i = 0; i < staticPaths.length; i++) {
    server.use('/' + staticPaths[i], express.static(staticPaths[i]));
}
server.use('/', routes);

server.listen(config.port, function() {
    console.log('Listening on port %d', config.port);
});
