let fs = require('fs'),
    Q = require('q');

function loadConfigJSON() {
    let deferred = Q.defer();

    fs.readFile('config.json', deferred.makeNodeResolver());

    return deferred.promise
        .then(JSON.parse);
}

function loadConfigEnv() {
    let configEnvMap = {
            awsAccessKeyId: 'AWS_ACCESS_KEY_ID',
            awsRegion: 'AWS_REGION',
            awsSecretAccessKey: 'AWS_SECRET_ACCESS_KEY',
            mongodbURI: 'MONGOLAB_URI',
            port: 'PORT',
            reviewboardAPIToken: 'REVIEWBOARD_API_TOKEN',
            reviewboardHost: 'REVIEWBOARD_HOST',
            sessionSecret: 'SESSION_SECRET',
            slackClientID: 'SLACK_CLIENT_ID',
            slackClientSecret: 'SLACK_CLIENT_SECRET',
            slackHost: 'SLACK_HOST',
            slackLogsTableName: 'SLACK_LOGS_TABLE_NAME',
            slackToken: 'SLACK_TOKEN',
            studentsURL: 'STUDENTS_URL'
        };

    return Q.promise(function(resolve) {
        let config = {};

        for (let configKey in configEnvMap) {
            if (configEnvMap.hasOwnProperty(configKey)) {
                let envKey = configEnvMap[configKey];
                config[configKey] = process.env[envKey];
            }
        }

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
