var fetch = require('node-fetch'),
    Q = require('q'),
    url = require('url'),
    util = require('util');

function getRBResource(config, resource, query) {
    var resourceURL = url.format({
            protocol: 'https',
            host: config.reviewboardHost,
            pathname: util.format('/api/%s/', resource),
            query: query
        }),
        options = {
            headers: { Authorization: 'token ' + config.reviewboardAPIToken }
        };

    return fetch(resourceURL, options).then(function(response) {
        return response.json();
    });
}

module.exports = function(config) {
    fetch.Promise = Q.Promise;

    return {
        getReviewRequests: function(username) {
            return getRBResource(config, 'review-requests', {
                'status': 'all',
                'from-user': username
            });
        }
    };
};
