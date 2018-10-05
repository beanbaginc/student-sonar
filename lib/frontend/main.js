// jshint ignore: start

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-toggle/css/bootstrap-toggle.css';
import 'x-editable/dist/bootstrap3-editable/css/bootstrap-editable.css';
import 'selectize/dist/css/selectize.bootstrap3.css';
import 'react-mde/lib/styles/css/react-mde-all.css';
import '../../css/style.less';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'bootstrap';
import 'bootstrap-datepicker';
import 'bootstrap-toggle';
import 'x-editable/dist/bootstrap3-editable/js/bootstrap-editable';
import 'selectize';
import './editable-defs';
import './editable-datepicker';
import './editable-selectize';


import Application from './application';
import configureStore from './redux/configure-store';


document.addEventListener('DOMContentLoaded', function() {
    const store = configureStore({
        loggedIn: (window.userId !== null),
        userType: window.userType,
    });

    ReactDOM.render(
        <Provider store={store}>
            <Application />
        </Provider>,
        document.querySelector('.root'));
});


export default {};
