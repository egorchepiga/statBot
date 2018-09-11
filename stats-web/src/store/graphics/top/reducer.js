import * as types from './actionType'

const initialState = { forChat: false};

export default function topWordsForChat(state = initialState, action) {
    if (action.type === types.SET_SECOND_ALL) {
        return {
            ...state,
            forChat : action.payload.forChat,
            options: action.payload.options,
            data: action.payload.data
        };
    }

    if (action.type === types.LOAD_MORE_WORDS) {
        return {
            ...state,
            more_user_words : action.payload
        };
    }

    return state;
}