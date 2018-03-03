const REQUEST_STATUS_REPORT_DUE_DATES = 'REQUEST_STATUS_REPORT_DUE_DATES';
const RECEIVE_STATUS_REPORT_DUE_DATES = 'RECEIVE_STATUS_REPORT_DUE_DATES';


const defaultState = {
    isFetching: false,
    items: [],
    lastUpdated: null,
};


export default function reducer(state=defaultState, action) {
    switch (action.type) {
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
    return {
        type: RECEIVE_STATUS_REPORT_DUE_DATES,
        items: data,
        receivedAt: Date.now(),
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
