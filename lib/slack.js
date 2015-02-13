var AWS = require('aws-sdk'),
    fetch = require('node-fetch'),
    https = require('https'),
    Q = require('q'),
    url = require('url');


module.exports = function(app) {
    var dynamoDB;

    AWS.config.region = app.get('awsRegion');
    AWS.config.accessKeyId = app.get('awsAccessKeyId');
    AWS.config.secretAccessKey = app.get('awsSecretAccessKey');

    dynamoDB = new AWS.DynamoDB();

    fetch.Promise = Q.Promise;

    return {
        getLogs: function(username) {
            var deferred = Q.defer();
            dynamoDB.query({
                TableName: app.get('slackLogsTableName'),
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
            var apiURL = url.format({
                protocol: 'https',
                host: app.get('slackHost'),
                pathname: '/api/users.list',
                query: {
                    token: app.get('slackToken')
                }
            });

            return fetch(apiURL).then(function(response) {
                return response.json();
            });
        }
    };
};
