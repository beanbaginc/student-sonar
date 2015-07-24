import 'bootstrap-tagsinput/dist/bootstrap-tagsinput.css!';
import 'bootstrap-toggle/css/bootstrap-toggle.css!';
import 'x-editable/dist/bootstrap3-editable/css/bootstrap-editable.css!';

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
