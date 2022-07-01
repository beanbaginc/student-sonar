from reviewboard.extensions.base import Extension

from rb_reviews_api.resources import review_resource


class ReviewsAPI(Extension):
    metadata = {
        'Name': 'rb_reviews_api',
        'Summary': 'An extension to add a more capable review list API '
                   'resource.',
    }

    resources = [review_resource]

    def initialize(self):
        pass
