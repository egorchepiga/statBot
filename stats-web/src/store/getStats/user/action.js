import * as types from './actionType';

export const setUserId = (data) =>
    dispatch => {
        dispatch({type: types.SET_USER_ID, payload: data});
    };
