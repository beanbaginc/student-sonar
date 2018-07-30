const DELETE_CALENDAR_ITEM = 'DELETE_CALENDAR_ITEM';
const RECEIVE_CALENDAR = 'RECEIVE_CALENDAR';
const RECEIVE_CALENDAR_ITEM = 'RECEIVE_CALENDAR_ITEM';
const REQUEST_CALENDAR = 'REQUEST_CALENDAR';


const defaultState = {
    isFetching: false,
    items: [],
    lastUpdated: null,
};


export default function reducer(state=defaultState, action) {
    switch (action.type) {
        case DELETE_CALENDAR_ITEM: {
            const items = Array.from(state.items);
            const index = state.items.findIndex(item => item._id === action.id);

            if (index !== -1) {
                items.splice(index, 1);
            }

            return Object.assign({}, state, {
                items: items,
            });
        }

        case RECEIVE_CALENDAR:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.items,
                lastUpdated: action.receivedAt,
            });

        case RECEIVE_CALENDAR_ITEM: {
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

        case REQUEST_CALENDAR:
            return Object.assign({}, state, {
                isFetching: true,
            });

        default:
            return state;
    }
}


function requestCalendar() {
    return {
        type: REQUEST_CALENDAR,
    };
}


function receiveCalendar(data) {
    return {
        type: RECEIVE_CALENDAR,
        items: data,
        receivedAt: Date.now(),
    };
}


function receiveCalendarItem(data) {
    return {
        type: RECEIVE_CALENDAR_ITEM,
        item: data,
    };
}


function finishDeleteCalendarItem(id) {
    return {
        type: DELETE_CALENDAR_ITEM,
        id: id,
    };
}


export function fetchCalendar() {
    return (dispatch, getState) => {
        const state = getState();

        if (!state.calendar.isFetching &&
            state.calendar.items.length === 0) {
            dispatch(requestCalendar());

            return fetch('/api/calendar-items')
                .then(response => response.json())
                .then(data => dispatch(receiveCalendar(data)));
        }
    };
}


export function saveCalendarItem(item) {
    return dispatch => {
        const update = (item._id !== undefined);
        const data = {
            date: item.date,
            show_to_groups: item.show_to_groups,
            summary: item.summary,
        };

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
            ? `/api/calendar-items/${item._id}`
            : '/api/calendar-items';
        fetch(url, options)
            .then(response => response.json())
            .then(data => dispatch(receiveCalendarItem(data)));
    };
}


export function deleteCalendarItem(id) {
    return dispatch => {
        const options = {
            method: 'DELETE',
            credentials: 'include',
        }

        fetch(`/api/calendar-items/${id}`, options)
            .then(() => dispatch(finishDeleteCalendarItem(id)));
    };
}
