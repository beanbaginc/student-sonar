var fs = require('fs'),
    Q = require('q');

function loadConfigJSON(app) {
    var deferred = Q.defer();

    fs.readFile('config.json', deferred.makeNodeResolver());

    return deferred.promise
        .then(JSON.parse)
        .then(function(config) {
            var key;

            for (key in config) {
                if (config.hasOwnProperty(key)) {
                    app.set(key, config[key]);
                }
            }
        });
}

function loadConfigEnv(app) {
    var configEnvMap = {
            awsAccessKeyId: 'AWS_ACCESS_KEY_ID',
            awsRegion: 'AWS_REGION',
            awsSecretAccessKey: 'AWS_SECRET_ACCESS_KEY',
            port: 'PORT',
            reviewboardAPIToken: 'REVIEWBOARD_API_TOKEN',
            reviewboardHost: 'REVIEWBOARD_HOST',
            slackHost: 'SLACK_HOST',
            slackLogsTableName: 'SLACK_LOGS_TABLE_NAME',
            slackToken: 'SLACK_TOKEN',
            studentsURL: 'STUDENTS_URL'
        },
        configKey,
        envKey;

    for (configKey in configEnvMap) {
        if (configEnvMap.hasOwnProperty(configKey)) {
            envKey = configEnvMap[configKey];
            app.set(configKey, process.env[envKey]);
        }
    }

    return Q.promise(function(resolve) {
        resolve();
    });
}

module.exports = function(app) {
    if (app.get('env') === 'production') {
        return loadConfigEnv(app);
    } else {
        return loadConfigJSON(app);
    }
};
