const SET_MANAGE = 'SET_MANAGE';


export default function reducer(state=false, action) {
    switch (action.type) {
        case SET_MANAGE:
            return action.manage;

        default:
            return state;
    }
}


export function setManage(manage) {
    return {
        type: SET_MANAGE,
        manage: manage,
    };
}
