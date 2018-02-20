import { combineReducers, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';

import manage from './modules/manage';
import projects from './modules/projects';
import users from './modules/users';


// Used for state which is preloaded from the server but will never change
// client-side.
function staticReducer(state=null, action) {
    return state;
}


const reducer = combineReducers({
    loggedIn: staticReducer,
    manage,
    projects,
    users,
    userType: staticReducer,
});


export default function configureStore(preloadedState) {
    return createStore(
        reducer,
        preloadedState,
        composeWithDevTools(applyMiddleware(thunkMiddleware)));
}
