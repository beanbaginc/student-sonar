const REQUEST_GROUPS = 'REQUEST_GROUPS';
const RECEIVE_GROUPS = 'RECEIVE_GROUPS';


const defaultState = {
    isFetching: false,
    items: [],
    lastUpdated: null,
};


export default function reducer(state=defaultState, action) {
    switch (action.type) {
        case REQUEST_GROUPS:
            return Object.assign({}, state, {
                isFetching: true,
            });

        case RECEIVE_GROUPS:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.groups,
                lastUpdated: action.receivedAt,
            });

        default:
            return state;
    }
}


function requestGroups() {
    return {
        type: REQUEST_GROUPS,
    };
};


function receiveGroups(data) {
    return {
        type: RECEIVE_GROUPS,
        groups: data,
        recievedAt: Date.now(),
    };
};


export function fetchGroups() {
    return dispatch => {
        dispatch(requestGroups());

        return fetch('/api/groups')
            .then(response => response.json())
            .then(data => dispatch(receiveGroups(data)));
    };
}
