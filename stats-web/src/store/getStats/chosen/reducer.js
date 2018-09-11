import * as types from './actionType'

const initialState = false;
export default function user(state = initialState, action) {
    if (action.type === types.CHOOSE) {
        return action.payload;
    }
    return state;
}