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
        letsEncryptChallengeKey: 'LETS_ENCRYPT_CHALLENGE_KEY',
        letsEncryptChallengeResponse: 'LETS_ENCRYPT_CHALLENGE_RESPONSE',
        memcachedPassword: 'MEMCACHEDCLOUD_PASSWORD',
        memcachedServers: 'MEMCACHEDCLOUD_SERVERS',
        memcachedUsername: 'MEMCACHEDCLOUD_USERNAME',
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
