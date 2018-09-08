import * as types from './actionType'

const initialState = { forChat: false };

export default function stickers(state = initialState, action) {
    if (action.type === types.SET_TOP_STICKERS) {
        return action.payload
    }
    return state;
}