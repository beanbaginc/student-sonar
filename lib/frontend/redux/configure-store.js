import { combineReducers, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import * as Sentry from "@sentry/react";

import manage from './modules/manage';


// Used for state which is preloaded from the server but will never change
// client-side.
function staticReducer(state=null, action) {
    return state;
}


const reducer = combineReducers({
    loggedIn: staticReducer,
    manage,
    userType: staticReducer,
});


export default function configureStore(preloadedState) {
    const sentryReduxEnhancer = Sentry.createReduxEnhancer({});

    return createStore(
        reducer,
        preloadedState,
        composeWithDevTools(applyMiddleware(thunkMiddleware), sentryReduxEnhancer));
}
