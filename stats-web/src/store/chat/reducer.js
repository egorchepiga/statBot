import * as types from './actionType'

export default function chat(state = null, action) {
    if (action.type === types.SET_CHAT) {
        return action.payload;
    }
    if (action.type === types.SET_USERS_IMAGE) {
        let top_stickers =  action.payload.readyStickers;
        let users = action.payload.users;
        let chat = {...state.chat};
        return {...state, users, chat: {...chat, top_stickers} };
    }

    return state;
}