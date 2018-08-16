import * as types from './actionType'

const initialState = {id: "162182640"};
export default function user(state = initialState, action) {
    if (action.type === types.SET_USER_ID) {  //пока что не id, а полностью изер
        return action.payload;
    }
    return state;
}