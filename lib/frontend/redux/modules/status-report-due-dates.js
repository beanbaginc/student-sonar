import moment from 'moment';


const DELETE_STATUS_REPORT_DUE_DATE = 'DELETE_STATUS_REPORT_DUE_DATE';
const RECEIVE_STATUS_REPORT_DUE_DATE = 'RECEIVE_STATUS_REPORT_DUE_DATE';
const REQUEST_STATUS_REPORT_DUE_DATES = 'REQUEST_STATUS_REPORT_DUE_DATES';
const RECEIVE_STATUS_REPORT_DUE_DATES = 'RECEIVE_STATUS_REPORT_DUE_DATES';


const defaultState = {
    isFetching: false,
    items: [],
    lastUpdated: null,
};


export default function reducer(state=defaultState, action) {
    switch (action.type) {
        case DELETE_STATUS_REPORT_DUE_DATE: {
            const items = Array.from(state.items);
            const index = state.items.findIndex(item => item._id === action.id);

            if (index !== -1) {
                items.splice(index, 1);
            };

            return Object.assign({}, state, {
                items: items,
            });
        }

        case RECEIVE_STATUS_REPORT_DUE_DATE: {
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

        case RECEIVE_STATUS_REPORT_DUE_DATES:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.items,
                lastUpdated: action.receivedAt,
            });

        case REQUEST_STATUS_REPORT_DUE_DATES:
            return Object.assign({}, state, {
                isFetching: true,
            });

        default:
            return state;
    }
}


function requestStatusReportDueDates() {
    return {
        type: REQUEST_STATUS_REPORT_DUE_DATES,
    };
}


function receiveStatusReportDueDates(data) {
    data.forEach(item => {
        item.date = moment(item.date);
    });

    return {
        type: RECEIVE_STATUS_REPORT_DUE_DATES,
        items: data,
        receivedAt: Date.now(),
    };
}


function receiveStatusReportDueDate(data) {
    data.date = moment(data.date);

    return {
        type: RECEIVE_STATUS_REPORT_DUE_DATE,
        item: data,
    };
}


function finishDeleteStatusReportDueDate(id) {
    return {
        type: DELETE_STATUS_REPORT_DUE_DATE,
        id: id,
    };
}


export function fetchStatusReportDueDates() {
    return (dispatch, getState) => {
        const state = getState();

        if (!state.statusReportDueDates.isFetching &&
            state.statusReportDueDates.items.length === 0) {
            dispatch(requestStatusReportDueDates());

            return fetch('/api/status-report-due-dates', { credentials: 'include' })
                .then(response => response.json())
                .then(data => dispatch(receiveStatusReportDueDates(data)));
        }
    };
}


export function saveStatusReportDueDate(item) {
    return dispatch => {
        const update = (item._id !== undefined);
        const data = {
            date: item.date.format(),
            show_to_groups: item.show_to_groups,
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
            ? `/api/status-report-due-dates/${item._id}`
            : '/api/status-report-due-dates';

        fetch(url, options)
            .then(response => response.json())
            .then(data => dispatch(receiveStatusReportDueDate(data)));
    };
}


export function deleteStatusReportDueDate(id) {
    return dispatch => {
        const options = {
            method: 'DELETE',
            credentials: 'include',
        };

        fetch(`/api/status-report-due-dates/${id}`, options)
            .then(() => dispatch(finishDeleteStatusReportDueDate(id)));
    };
}
