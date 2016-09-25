"""Tests basic behaviour for the rb_auto_assigner Review Board extension."""

from __future__ import unicode_literals

from django.contrib.auth.models import User
from reviewboard.extensions.testing import ExtensionTestCase

from rb_auto_assigner.extension import RBAutoAssigner


class RBAutoAssignerTests(ExtensionTestCase):
    """Unit tests for RBAutoAssigner."""

    extension_class = RBAutoAssigner

    def set_assignees(self, assignees):
        """Set the auto-assignee list.

        Args:
            assignees (list of unicode):
                A list of user names.
        """
        self.extension.settings['assignees'] = ','.join(assignees)

    def setUp(self):
        self.group = \
            self.create_review_group(name=RBAutoAssigner.auto_assign_group)
        self.mcfly = User.objects.create_user(username='mcfly')
        self.docbrown = User.objects.create_user(username='docbrown')
        self.biff = User.objects.create_user(username='biff')
        super(RBAutoAssignerTests, self).setUp()

    def test_base_case(self):
        """Test a single user being auto-assigned."""
        self.set_assignees(['mcfly', 'someone_else'])
        review_request = self.create_review_request(submitter='mcfly')
        self.assertIn(self.group, review_request.target_groups.all())

    def test_only_autoassign_specified(self):
        """Test only users in the assignee list are auto-assigned."""
        self.set_assignees(['mconley', 'someone_else'])
        review_request = self.create_review_request(submitter='mcfly')
        self.assertNotIn(self.group, review_request.target_groups.all())

    def test_multiple_assignees(self):
        """Test multiple auto-assignees."""
        self.set_assignees(['mcfly', 'docbrown'])
        mcfly_rr = self.create_review_request(submitter='mcfly')
        docbrown_rr = self.create_review_request(submitter='docbrown')
        biff_rr = self.create_review_request(submitter='biff')
        self.assertIn(self.group, mcfly_rr.target_groups.all())
        self.assertIn(self.group, docbrown_rr.target_groups.all())
        self.assertNotIn(self.group, biff_rr.target_groups.all())

    def test_empty_assignees(self):
        """Test with an empty auto-assignee list."""
        self.set_assignees([])
        mcfly_rr = self.create_review_request(submitter='mcfly')
        docbrown_rr = self.create_review_request(submitter='docbrown')
        biff_rr = self.create_review_request(submitter='biff')
        self.assertNotIn(self.group, mcfly_rr.target_groups.all())
        self.assertNotIn(self.group, docbrown_rr.target_groups.all())
        self.assertNotIn(self.group, biff_rr.target_groups.all())
