import * as types from './actionType'

const initialState = { forChat: false};

export default function topWordsForChat(state = initialState, action) {
    if (action.type === types.SET_SECOND_ALL) {
        return {
            forChat : action.payload.forChat,
            options: action.payload.options,
            data: action.payload.data
        };
    }
    return state;
}