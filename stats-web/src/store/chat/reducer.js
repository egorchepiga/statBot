import * as types from './actionType'

export default function chat(state = null, action) {
    if (action.type === types.SET_CHAT) {
        return action.payload;
    }
    if (action.type === types.SET_USERS_IMAGE) {
        let top_stickers =  action.payload.readyStickers;
        let users = action.payload.users;
        let chat = state ? {...state.chat} : null;
        return chat ? {...state, users, chat: {...chat, top_stickers} } : "deleted";
    }

    if (action.type === types.SET_COLOR_THEME) {
        return {...state, theme : action.payload}
    }

    return state;
}