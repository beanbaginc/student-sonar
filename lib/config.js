var fs = require('fs'),
    Q = require('q');

function loadConfigJSON() {
    var deferred = Q.defer();

    fs.readFile('config.json', deferred.makeNodeResolver());

    return deferred.promise
        .then(JSON.parse);
}

function loadConfigEnv() {
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
        envKey,
        config = {};

    for (configKey in configEnvMap) {
        if (configEnvMap.hasOwnProperty(configKey)) {
            envKey = configEnvMap[configKey];
            config[configKey] = process.env[envKey];
        }
    }

    return Q.promise(function(resolve) {
        resolve(config);
    });
}

module.exports = function() {
    if (process.env.NODE_ENV === 'production') {
        return loadConfigEnv();
    } else {
        return loadConfigJSON();
    }
};
