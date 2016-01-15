from __future__ import unicode_literals

import logging

from django.db.models.signals import post_save
from reviewboard.extensions.base import Extension
from reviewboard.extensions.hooks import SignalHook
from reviewboard.reviews.models.group import Group
from reviewboard.reviews.models.review_request_draft import ReviewRequest


class RBAutoAssigner(Extension):
    metadata = {
        'Name': 'Review Board Auto-Assigner',
        'Summary': 'Automatically assigns review requests from members of '
                   'a comma-separated list to the students group.',
    }

    is_configurable = True

    default_settings = {
        'assignees': '',
    }

    auto_assign_group = 'students'

    def initialize(self):
        SignalHook(self, post_save, self.on_post_save, sender=ReviewRequest)

    def on_post_save(self, instance=None, **kwargs):
        if not instance:
            logging.error('rb_auto_assigner did not receive a ReviewRequest')
            return

        user = instance.submitter

        assignees = [
            s.strip() for s in
            self.settings.get('assignees').split(',')
        ]

        if user.username not in assignees:
            return

        try:
            group = Group.objects.get(name=self.auto_assign_group)
        except Group.DoesNotExist:
            logging.error('rb_auto_assigner can not find a group with '
                          'name %s', self.auto_assign_group)

        logging.debug('rb_auto_assigner auto-assigning review request from '
                      'user %s to group %s',
                      user.username, group.name)

        instance.target_groups.add(group)
