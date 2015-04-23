let AWS = require('aws-sdk'),
    fetch = require('node-fetch'),
    https = require('https'),
    Q = require('q'),
    url = require('url');


module.exports = function(config) {
    AWS.config.region = config.awsRegion;
    AWS.config.accessKeyId = config.awsAccessKeyId;
    AWS.config.secretAccessKey = config.awsSecretAccessKey;

    let dynamoDB = new AWS.DynamoDB();

    fetch.Promise = Q.Promise;

    return {
        getLogs: function(username) {
            let deferred = Q.defer();
            dynamoDB.query({
                TableName: config.slackLogsTableName,
                IndexName: 'user_name-timestamp-index',
                KeyConditions: {
                    user_name: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: [{S: username}]
                    }
                }
            }, deferred.makeNodeResolver());

            return deferred.promise;
        },

        getUsers: function() {
            let apiURL = url.format({
                protocol: 'https',
                host: config.slackHost,
                pathname: '/api/users.list',
                query: {
                    token: config.slackToken
                }
            });

            return fetch(apiURL).then(function(response) {
                return response.json();
            });
        }
    };
};
