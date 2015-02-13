var fetch = require('node-fetch'),
    Q = require('q'),
    url = require('url'),
    util = require('util');

function getRBResource(app, resource, query) {
    var resourceURL = url.format({
            protocol: 'https',
            host: app.get('reviewboardHost'),
            pathname: util.format('/api/%s/', resource),
            query: query
        }),
        options = {
            headers: { Authorization: 'token ' + app.get('reviewboardAPIToken') }
        };

    return fetch(resourceURL, options).then(function(response) {
        return response.json();
    });
}

module.exports = function(app) {
    fetch.Promise = Q.Promise;

    return {
        getReviewRequests: function(username) {
            return getRBResource(app, 'review-requests', {
                'status': 'all',
                'from-user': username
            });
        }
    };
};
