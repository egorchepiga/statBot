import * as types from './actionType'
const initialState = {find: ''};
export default function userList(state = initialState, action) {

    if (action.type === types.FIND_USER) {
        return { ...state, find : action.payload }
    }
    return state;
}