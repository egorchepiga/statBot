import * as types from './actionType'

const initialState = {};
export default function timeMessage(state = initialState, action) {
    if (action.type === types.SET_THIRD_ALL) {
        return action.payload;
    }
    return state;
}