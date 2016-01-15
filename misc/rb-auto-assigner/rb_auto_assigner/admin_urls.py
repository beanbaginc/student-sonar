from __future__ import unicode_literals

from django.conf.urls import patterns, url

from rb_auto_assigner.extension import RBAutoAssigner
from rb_auto_assigner.forms import RBAutoAssignerConfigForm


urlpatterns = patterns(
    '',

    url(r'^$',
        'reviewboard.extensions.views.configure_extension',
        {
            'ext_class': RBAutoAssigner,
            'form_class': RBAutoAssignerConfigForm
        },
        name='rbautoassigner-configure'),
)
