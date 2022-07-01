from django.forms import CharField, Textarea
from django.utils.translation import ugettext_lazy as _
from djblets.extensions.forms import SettingsForm


class RBAutoAssignerConfigForm(SettingsForm):
    """Settings form for choosing auto-assignees."""

    assignees = CharField(
        label=_('Students'),
        help_text=_('Comma-separated list of auto-assignee usernames.'),
        widget=Textarea(attrs={'cols': 80, 'rows': 10}),
        required=False)
