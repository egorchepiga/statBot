import * as types from "./actionType";

const initState = {list: ['d','3'], input:"", edit: -1};
export default function banForm(state = initState, action) {
    if (action.type === types.SET_INPUT) {
        return {
            ...state,
            bannedWords: {
                ...state.bannedWords,
                input: action.payload
            }
        }
    } else if (action.type === types.SET_EDIT) {
        return {
            ...state,
            bannedWords: {
                ...state.bannedWords,
                edit: action.payload,
                input: state.bannedWords.list[action.payload]
            }
        }
    } else if (action.type === types.SAVE_INPUT) {
        return {
            ...state,
            bannedWords: {
                list: action.payload,
                input: "",
                edit: -1
            }
        }
    }
    return state;
}