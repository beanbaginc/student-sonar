const RECEIVE_STATUS_REPORT = 'RECEIVE_STATUS_REPORT';
const RECEIVE_STATUS_REPORTS = 'RECEIVE_STATUS_REPORTS';
const REQUEST_STATUS_REPORTS = 'REQUEST_STATUS_REPORTS';


const defaultState = {
    isFetching: false,
    items: [],
    lastUpdated: null,
};


export default function reducer(state=defaultState, action) {
    switch (action.type) {
        case RECEIVE_STATUS_REPORT: {
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

        case RECEIVE_STATUS_REPORTS:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.items,
                lastUpdated: action.receivedAt,
            });

        case REQUEST_STATUS_REPORTS:
            return Object.assign({}, state, {
                isFetching: true,
            });

        default:
            return state;
    }
}


function requestStatusReports() {
    return {
        type: REQUEST_STATUS_REPORTS,
    };
}


function receiveStatusReport(data) {
    return {
        type: RECEIVE_STATUS_REPORT,
        item: data,
    };
}


function receiveStatusReports(data) {
    return {
        type: RECEIVE_STATUS_REPORTS,
        items: data,
        receivedAt: Date.now(),
    };
}


export function fetchStatusReports() {
    return (dispatch, getState) => {
        const state = getState();

        if (!state.statusReports.isFetching &&
            state.statusReports.items.length === 0) {
            dispatch(requestStatusReports());

            return fetch('/api/status-reports', { credentials: 'include' })
                .then(response => response.json())
                .then(data => dispatch(receiveStatusReports(data)));
        }
    };
}


export function saveStatusReport(statusReport) {
    return dispatch => {
        const update = (statusReport._id !== undefined);
        const data = {
            date_due: statusReport.date_due,
            text: statusReport.text,
            user: statusReport.user,
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
            ? `/api/status-reports/${statusReport._id}`
            : '/api/status/reports';
        fetch(url, options)
            .then(response => response.json())
            .then(data => dispatch(receiveStatusReport(data)));
    }
}
