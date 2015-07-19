import 'bootstrap/css/bootstrap.css!';

import $ from 'jquery';
import Backbone from 'backbone';

import Application from './application';
import ApplicationView from './application-view';


$(function() {
    const application = new Application();
    window.application = application;

    const applicationView = new ApplicationView({
        el: $('body'),
        model: application
    });

    $('body').append(applicationView.render().el);

    application.start();
});


export default {};
