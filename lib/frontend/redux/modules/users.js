const REQUEST_USERS = 'REQUEST_USERS';
const RECEIVE_USERS = 'RECEIVE_USERS';


const defaultState = {
    isFetching: false,
    items: [],
    lastUpdated: null,
    myUser: null,
};


export default function reducer(state=defaultState, action) {
    switch (action.type) {
        case REQUEST_USERS:
            return Object.assign({}, state, {
                isFetching: true,
            });

        case RECEIVE_USERS:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.users,
                lastUpdated: action.receivedAt,
                myUser: action.users.find(item => item._id === window.userId),
            });

        default:
            return state;
    }
}


function requestUsers() {
    return {
        type: REQUEST_USERS,
    };
}


function receiveUsers(data) {
    return {
        type: RECEIVE_USERS,
        users: data,
        receivedAt: Date.now(),
    };
}


export function fetchUsers() {
    return dispatch => {
        dispatch(requestUsers());

        return fetch('/api/users')
            .then(response => response.json())
            .then(data => dispatch(receiveUsers(data)));
    };
}
