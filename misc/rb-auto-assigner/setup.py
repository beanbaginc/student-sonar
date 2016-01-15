from __future__ import unicode_literals

from reviewboard.extensions.packaging import setup


PACKAGE = 'rb_auto_assigner'
VERSION = '0.1'

setup(
    name=PACKAGE,
    version=VERSION,
    description='Automatically assigns review requests from members of a '
                'a comma-separated list to the students group.',
    author='Mike Conley',
    packages=['rb_auto_assigner'],
    entry_points={
        'reviewboard.extensions':
            '%s = rb_auto_assigner.extension:RBAutoAssigner' % PACKAGE,
    }
)
