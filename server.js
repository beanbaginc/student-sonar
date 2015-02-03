var express = require('express'),
    logger = require('morgan'),
    config = require('./config'),
    routes = require('./lib/routes')(config),
    server = express();

server.use(logger('combined'));
server.use(express.static('.'));
server.use('/', routes);

server.listen(config.port, function() {
    console.log('Listening on port %d', config.port);
});
