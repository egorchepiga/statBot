import * as types from './actionType'
const initialState = {active: true, nav:[]};
export default function chat_profile(state = initialState, action) {

    if (action.type === types.SET_INFO) {
        return action.payload;
    }
    return state;
}