from django.urls import path
from reviewboard.extensions.views import configure_extension

from rb_auto_assigner.extension import RBAutoAssigner
from rb_auto_assigner.forms import RBAutoAssignerConfigForm


urlpatterns = [
    path(
        '',
        configure_extension,
        {
            'ext_class': RBAutoAssigner,
            'form_class': RBAutoAssignerConfigForm
        },
        name='rbautoassigner-configure'),
]
