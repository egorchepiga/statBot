import * as types from './actionType'

export default function chat(state = null, action) {
    if (action.type === types.SET_CHAT) {
        return action.payload;
    }
    return state;
}