from __future__ import unicode_literals

import dateutil

from django.utils import six
from djblets.util.decorators import augment_method_from
from djblets.webapi.decorators import webapi_request_fields
from reviewboard.reviews.models.review import Review
from reviewboard.webapi.decorators import webapi_check_local_site
from reviewboard.webapi.resources.base_review import BaseReviewResource


class ReviewResource(BaseReviewResource):
    uri_object_key = 'review_id'

    @webapi_check_local_site
    @webapi_request_fields(
        optional={
            'from-user': {
                'type': six.text_type,
                'description': 'The username that the reviews must be owned '
                               'by.',
            },
            'time-added-to': {
                'type': six.text_type,
                'description': 'The date/time that all reviews must be added '
                               'before. This is compared against the '
                               'review\'s ``timestamp`` field. This must be '
                               'a valid :term:`date/time format`.',
            },
            'time-added-from': {
                'type': six.text_type,
                'description': 'The date/time that all reviews must be added '
                               'after. This is compared against the '
                               'review\'s ``timestamp`` field. This must be '
                               'a valid :term:`date/time format`.',
            }
        }
    )
    @augment_method_from(BaseReviewResource)
    def get_list(self, *args, **kwargs):
        """Returns the list of all public reviews."""
        pass

    def get_queryset(self, request, is_list=False, *args, **kwargs):
        qs = Review.objects.filter(public=True,
                                   base_reply_to__isnull=True)

        if 'from-user' in request.GET:
            qs = qs.filter(user__username=request.GET.get('from-user'))

        if 'time-added-to' in request.GET:
            date = self._parse_date(request.GET.get('time-added-to'))
            qs = qs.filter(timestamp__gte=date)

        if 'time-added-from' in request.GET:
            date = self._parse_date(request.GET.get('time-added-from'))
            qs = qs.filter(timestamp__gte=date)

        return qs

    def _parse_date(self, timestamp_str):
        try:
            return dateutil.parser.parse(timestamp_str)
        except ValueError:
            return None


review_resource = ReviewResource()
