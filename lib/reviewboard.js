import fetch from 'node-fetch';
import url from 'url';
import util from 'util';


function getRBResource(config, resource, query) {
    const resourceURL = url.format({
        protocol: 'https',
        host: config.reviewboardHost,
        pathname: util.format('/api/%s/', resource),
        query: query,
    });
    const options = {
        headers: { Authorization: `token ${config.reviewboardAPIToken}` },
    };

    return fetch(resourceURL, options)
        .then(rsp => rsp.json());
}


export default function(config) {
    this.getReviewRequests = username => getRBResource(
        config, 'review-requests',
        {
            'expand': 'changes',
            'force-text-type': 'html',
            'from-user': username,
            'max-results': 200,
            'status': 'all',
        });

    this.getReviews = username => getRBResource(
        config, 'extensions/rb_reviews_api.extension.ReviewsAPI/reviews',
        { 'from-user': username });
}
