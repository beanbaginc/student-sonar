import { combineReducers, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';

import manage from './modules/manage';
import projects from './modules/projects';
import users from './modules/users';


const reducer = combineReducers({
    manage,
    projects,
    users,
});


export default function configureStore(preloadedState) {
    return createStore(
        reducer,
        preloadedState,
        composeWithDevTools(applyMiddleware(thunkMiddleware)));
}
