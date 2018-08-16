import * as types from './actionType'

const initialState = {};

export default function topWordsForChat(state = initialState, action) {
    if (action.type === types.SET_SECOND_ALL) {
        return {
            options: action.payload.options,
            data: action.payload.data
        };
    }
    return state;
}