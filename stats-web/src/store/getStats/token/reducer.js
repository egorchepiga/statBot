import * as types from './actionType'

const initialState = "INIT_TOKEN";
export default function token(state = initialState, action) {
    if (action.type === types.SET_TOKEN) {
        return action.payload;
    }
    return state;
}