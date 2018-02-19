const REQUEST_PROJECTS = 'REQUEST_PROJECTS';
const RECEIVE_PROJECTS = 'RECEIVE_PROJECTS';


const defaultState = {
    isFetching: false,
    items: [],
    lastUpdated: null,
};


export default function reducer(state=defaultState, action) {
    switch (action.type) {
        case REQUEST_PROJECTS:
            return Object.assign({}, state, {
                isFetching: true,
            });

        case RECEIVE_PROJECTS:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.projects,
                lastUpdated: action.receivedAt,
            });

        default:
            return state;
    }
}


function requestProjects() {
    return {
        type: REQUEST_PROJECTS,
    };
}


function receiveProjects(data) {
    return {
        type: RECEIVE_PROJECTS,
        projects: data,
        receivedAt: Date.now(),
    };
}


export function fetchProjects() {
    return (dispatch, getState) => {
        const state = getState();

        if (!state.projects.isFetching && state.projects.items.length === 0) {
            dispatch(requestProjects());

            return fetch('/api/student-projects')
                .then(response => response.json())
                .then(data => dispatch(receiveProjects(data)));
        }
    };
}
