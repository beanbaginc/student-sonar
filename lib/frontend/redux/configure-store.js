import { combineReducers, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';

import calendar from './modules/calendar';
import manage from './modules/manage';
import projects from './modules/projects';
import statusReportDueDates from './modules/status-report-due-dates';
import statusReports from './modules/status-reports';
import users from './modules/users';


// Used for state which is preloaded from the server but will never change
// client-side.
function staticReducer(state=null, action) {
    return state;
}


const reducer = combineReducers({
    calendar,
    loggedIn: staticReducer,
    manage,
    projects,
    statusReportDueDates,
    statusReports,
    users,
    userType: staticReducer,
});


export default function configureStore(preloadedState) {
    return createStore(
        reducer,
        preloadedState,
        composeWithDevTools(applyMiddleware(thunkMiddleware)));
}
