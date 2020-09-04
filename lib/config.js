import fs from 'fs';


function loadConfigJSON() {
    return new Promise((resolve, reject) => {
        try {
            resolve(JSON.parse(fs.readFileSync('config.json')));
        } catch (e) {
            reject(e);
        }
    });
}


function loadConfigEnv() {
    const configEnvMap = {
        asanaAccessToken: 'ASANA_ACCESS_TOKEN',
        asanaStudentProjectsID: 'ASANA_STUDENT_PROJECTS_ID',
        asanaWorkspaceID: 'ASANA_WORKSPACE_ID',
        awsAccessKeyId: 'AWS_ACCESS_KEY_ID',
        awsRegion: 'AWS_REGION',
        awsSecretAccessKey: 'AWS_SECRET_ACCESS_KEY',
        calendarURL: 'CALENDAR_URL',
        databaseURL: 'DATABASE_URL',
        letsEncryptChallengeKey: 'LETS_ENCRYPT_CHALLENGE_KEY',
        letsEncryptChallengeResponse: 'LETS_ENCRYPT_CHALLENGE_RESPONSE',
        memcachedPassword: 'MEMCACHIER_PASSWORD',
        memcachedServers: 'MEMCACHIER_SERVERS',
        memcachedUsername: 'MEMCACHIER_USERNAME',
        port: 'PORT',
        reviewboardAPIToken: 'REVIEWBOARD_API_TOKEN',
        reviewboardHost: 'REVIEWBOARD_HOST',
        sentryDsn: 'SENTRY_DSN',
        sentryDsnBackend: 'SENTRY_DSN_BACKEND',
        sessionSecret: 'SESSION_SECRET',
        slackClientID: 'SLACK_CLIENT_ID',
        slackClientSecret: 'SLACK_CLIENT_SECRET',
        slackHost: 'SLACK_HOST',
        slackLogsTableName: 'SLACK_LOGS_TABLE_NAME',
        slackLogsQueueName: 'SLACK_LOGS_QUEUE_NAME',
        slackToken: 'SLACK_TOKEN',
        studentsURL: 'STUDENTS_URL'
    };

    return new Promise((resolve, reject) => {
        const config = {};

        for (let [configKey, envKey] of Object.entries(configEnvMap)) {
            config[configKey] = process.env[envKey];
        }

        resolve(config);
    });
}


export default function() {
    if (process.env.NODE_ENV === 'production') {
        return loadConfigEnv();
    } else {
        return loadConfigJSON();
    }
}
