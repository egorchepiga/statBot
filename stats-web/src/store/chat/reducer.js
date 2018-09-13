import * as types from './actionType'

export default function chat(state = {theme:null, bannedWords: {list: ['d','3'], input:"", edit: -1}}, action) {
    if (action.type === types.SET_CHAT) {
        return action.payload;
    } else if (action.type === types.SET_USERS_IMAGE) {
        return {
            ...state,
            users: action.payload.users, 
            chat: {
                ...state.chat, 
                top_stickers: action.payload.readyStickers
            }};
    } else if (action.type === types.SET_COLOR_THEME) {
        return {...state, theme : action.payload}
    } else if (action.type === types.SET_INPUT) {
        return {...state, 
            bannedWords:{...state.bannedWords,
                input: action.payload }}
    } else if (action.type === types.SET_EDIT) {
        return {...state,
            bannedWords:{...state.bannedWords,
            edit: action.payload,
            input:  state.bannedWords.list[action.payload]}}
    } else if (action.type === types.SAVE_INPUT) {
        return {...state,
            bannedWords:{
                list: action.payload,
                input: "",
                edit: -1 }}
    }

    return state;
}