from reviewboard.extensions.packaging import setup


PACKAGE = 'rb_reviews_api'
VERSION = '1.0'

setup(
    name=PACKAGE,
    version=VERSION,
    description='An extension to add a more capable review list API resource',
    author='Beanbag, Inc.',
    author_email='support@beanbaginc.com',
    maintainer='Beanbag, Inc.',
    maintainer_email='support@beanbaginc.com',
    packages=['rb_reviews_api'],
    entry_points={
        'reviewboard.extensions':
            '%s = rb_reviews_api.extension:ReviewsAPI' % PACKAGE,
    },
    package_data={
        'rb_reviews_api': [
            'templates/rb_reviews_api/*.txt',
            'templates/rb_reviews_api/*.html',
        ],
    }
)
