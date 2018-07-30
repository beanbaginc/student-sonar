const REQUEST_USERS = 'REQUEST_USERS';
const RECEIVE_USER = 'RECEIVE_USER';
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

        case RECEIVE_USER: {
            const items = Array.from(state.items);
            const index = items.findIndex(item => item._id === action.item._id);

            if (index !== -1) {
                items[index] = action.item;
            } else {
                items.push(action.item);
            }

            return Object.assign({}, state, {
                items: items,
            });
        }

        case RECEIVE_USERS:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.users.sort((a, b) => a.name.localeCompare(b.name)),
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


function receiveUser(item) {
    return {
        type: RECEIVE_USER,
        item: item,
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


export function saveUser(item) {
    return dispatch => {
        const update = (item._id !== undefined);
        const data = Object.assign({}, item);
        delete data._id;
        delete data.__v;

        const body = JSON.stringify(data);
        const options = {
            method: update ? 'PUT' : 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length,
            },
            credentials: 'include',
        };

        const url = update
            ? `/api/users/${item._id}`
            : '/api/users';

        fetch(url, options)
            .then(response => response.json())
            .then(data => dispatch(receiveUser(data)));
    };
}
