import * as types from './actionType'
const initState = {
    bannedWords: {
        list: {0: 'd', 1: '3'}, 
        input: "", 
        edit: -1,
        search: "",
        visibleList: {0: 'd', 1: '3'}
    },
    /*chat: {
        id: null,
        img: null,
        summary: -1,
        top_stickers: {},
        top_words: {},
        user: null  //Сюда заносится название чата.. надо убрать
    },*/
    theme: -1,
    /*time: [],
    timeReady: [],
    users: [],
    name: null*/
}
export default function chat(state = initState, action) {
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
            bannedWords:{...state.bannedWords,
                list: action.payload,
                input: "",
                edit: -1 }}
    } else if (action.type === types.SET_SEARCH) {
        return {...state, 
            bannedWords:{...state.bannedWords,
                search: action.payload }}
    } else if (action.type === types.SET_VISIBLE_LIST) {
        console.log(action.payload)
        return {...state, 
            bannedWords:{...state.bannedWords,
                visibleList: action.payload }}
    } 

    return state;
}