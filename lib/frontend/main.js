// jshint ignore: start

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-toggle/css/bootstrap-toggle.css';
import 'x-editable/dist/bootstrap3-editable/css/bootstrap-editable.css';
import '@selectize/selectize/dist/css/selectize.bootstrap3.css';
import 'react-mde/lib/styles/css/react-mde-all.css';
import '../../css/style.less';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import * as Sentry from "@sentry/react";
import 'bootstrap';
import 'bootstrap-datepicker';
import 'bootstrap-toggle';
import 'x-editable/dist/bootstrap3-editable/js/bootstrap-editable.js';
import '@selectize/selectize/dist/js/standalone/selectize.js';
import './editable-defs.js';
import './editable-datepicker.js';
import './editable-selectize.js';


import Application from './application.jsx';
import configureStore from './redux/configure-store.js';


document.addEventListener('DOMContentLoaded', function() {
    Sentry.init({ dsn: window.sentryDsn });

    const store = configureStore({
        loggedIn: (window.userId !== null),
        userType: window.userType,
    });

    ReactDOM.render(
        <Sentry.ErrorBoundary fallback={"An error has occured"}>
            <Provider store={store}>
                <Application />
            </Provider>
        </Sentry.ErrorBoundary>,
        document.querySelector('.root'));
});


export default {};
