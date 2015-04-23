let mongoose = require('mongoose'),
    Q = require('q'),
    loadConfig = require('./config'),
    schema = require('./schema');

function initConfig(options) {
    return loadConfig().then(function(config) {
        options.config = config;
        return options;
    });
}

function initMongodb(options) {
    let deferred = Q.defer();

    mongoose.connect(options.config.mongodbURI);
    let db = mongoose.connection;

    db.on('error', deferred.reject);
    db.once('open', deferred.resolve);

    return deferred.promise.then(function() {
        console.log('Connected to MongoDB at %s', options.config.mongodbURI);

        schema.init(mongoose);

        options.db = db;
        return options;
    });
}


module.exports = function() {
    return initConfig({}).then(initMongodb);
};
