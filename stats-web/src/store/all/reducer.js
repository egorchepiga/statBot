import * as types from './actionType'
const initialState = {chats:[]};
export default function stats(state = initialState, action) {
    if (action.type === types.SET_CHATS) {
        return {...state, chats : action.payload}
    }
    return state;
}
