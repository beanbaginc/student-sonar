import dateutil

from djblets.util.decorators import augment_method_from
from djblets.webapi.fields import StringFieldType
from djblets.webapi.decorators import webapi_request_fields
from reviewboard.reviews.models.review import Review
from reviewboard.webapi.decorators import webapi_check_local_site

# This nonsense is required to avoid a circular dependency when building
# packages.
from reviewboard.webapi.resources import resources
resources.review
from reviewboard.webapi.resources.review import BaseReviewResource


class ReviewResource(BaseReviewResource):
    uri_object_key = 'review_id'

    @webapi_check_local_site
    @webapi_request_fields(
        optional={
            'from-user': {
                'type': StringFieldType,
                'description': 'The username that the reviews must be owned '
                               'by.',
            },
            'time-added-to': {
                'type': StringFieldType,
                'description': 'The date/time that all reviews must be added '
                               'before. This is compared against the '
                               'review\'s ``timestamp`` field. This must be '
                               'a valid :term:`date/time format`.',
            },
            'time-added-from': {
                'type': StringFieldType,
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
