import * as types from './actionType'
const initialState = [];
export default function stats(state = initialState, action) {
    if (action.type === types.SET_CHATS) {
        return action.payload;
    }
    return state;
}
