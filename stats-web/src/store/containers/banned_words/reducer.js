import * as types from "./actionType";

const initState = {list: {/*0: 'd', 1: '3'*/}, 
        input: "", 
        edit: -1,
        search: "",
        visibleList: {/*0: 'd', 1: '3'*/},
        isOpen: false
    };
export default function banForm(state = initState, action) {
    if (action.type === types.SET_ALL) {
        return action.payload
    } else if (action.type === types.SET_INPUT) {
        return {
            ...state,
                input: action.payload
        }
    } else if (action.type === types.SET_EDIT) {
        return {
            ...state,
                edit: action.payload,
                input: state.list[action.payload]
            
        }
    } else if (action.type === types.SAVE_INPUT) {
        return {
            ...state,
                list: action.payload,
                input: "",
                edit: -1
            
        }        
    } else if (action.type === types.OPEN) {
        return {
            ...state,
                isOpen: !state.isOpen
        }      
    } else if (action.type === types.SET_SEARCH) {
        return {...state, 
                search: action.payload 
            }
    } else if (action.type === types.SET_VISIBLE_LIST) {
        return {...state, 
                visibleList: action.payload 
            }
    } 
    return state;
}