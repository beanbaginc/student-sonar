let fetch = require('node-fetch'),
    Q = require('q'),
    url = require('url'),
    util = require('util');

function getRBResource(config, resource, query) {
    let resourceURL = url.format({
            protocol: 'https',
            host: config.reviewboardHost,
            pathname: util.format('/api/%s/', resource),
            query: query
        }),
        options = {
            headers: { Authorization: 'token ' + config.reviewboardAPIToken }
        };

    return fetch(resourceURL, options).then(response => response.json());
}

module.exports = function(config) {
    fetch.Promise = Q.Promise;

    return {
        getReviewRequests: function(username) {
            return getRBResource(config, 'review-requests', {
                'expand': 'changes',
                'force-text-type': 'html',
                'from-user': username,
                'max-results': 200,
                'status': 'all'
            });
        },

        getReviews: function(username) {
            return getRBResource(config, 'extensions/rb_reviews_api.extension.ReviewsAPI/reviews', {
                'from-user': username
            });
        }
    };
};
