import * as types from './actionType';

export const setChat = (payload) =>
    dispatch => {
        dispatch({type: types.SET_CHAT, payload})
    };
