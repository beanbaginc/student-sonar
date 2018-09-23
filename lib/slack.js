import AWS from 'aws-sdk';
import fetch from 'node-fetch';
import url from 'url';


export default function(config) {
    AWS.config.region = config.awsRegion;
    AWS.config.accessKeyId = config.awsAccessKeyId;
    AWS.config.secretAccessKey = config.awsSecretAccessKey;

    const dynamoDB = new AWS.DynamoDB();

    this.getLogs = userid => {
        const request = dynamoDB.query({
            TableName: config.slackLogsTableName,
            IndexName: 'user_id-timestamp-index',
            KeyConditions: {
                user_id: {
                    ComparisonOperator: 'EQ',
                    AttributeValueList: [{S: userid}]
                },
            },
        });
        return request.promise();
    };

    this.getUsers = () => {
        const apiURL = url.format({
            protocol: 'https',
            host: config.slackHost,
            pathname: '/api/users.list',
            query: { token: config.slackToken },
        });

        return fetch(apiURL).then(rsp => rsp.json());
    };
}
