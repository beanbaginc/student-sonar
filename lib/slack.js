const AWS = require('aws-sdk'),
      fetch = require('node-fetch'),
      https = require('https'),
      Q = require('q'),
      url = require('url');


module.exports = function(config) {
    AWS.config.region = config.awsRegion;
    AWS.config.accessKeyId = config.awsAccessKeyId;
    AWS.config.secretAccessKey = config.awsSecretAccessKey;

    const dynamoDB = new AWS.DynamoDB();

    fetch.Promise = Q.Promise;

    return {
        getLogs: function(username) {
            return Q.nfcall(dynamoDB.query.bind(dynamoDB), {
                TableName: config.slackLogsTableName,
                IndexName: 'user_name-timestamp-index',
                KeyConditions: {
                    user_name: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: [{S: username}]
                    }
                }
            });
        },

        getUsers: function() {
            const apiURL = url.format({
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
