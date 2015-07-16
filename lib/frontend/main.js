import $ from 'jquery';
import Backbone from 'backbone';

import Application from './application';
import ApplicationView from './application-view';


$(function() {
    const application = new Application();
    const applicationView = new ApplicationView({ model: application });

    $('body').append(applicationView.render().el);

    application.start();
});


export default {};
