import * as types from './actionType'
const initialState = {find: '', showAll : false};
export default function userList(state = initialState, action) {

    if (action.type === types.FIND_USER) {
        return { ...state, find : action.payload }
    }

    if (action.type === types.SHOW_ALL) {
        return { ...state, showAll : !state.showAll }
    }

    return state;
}