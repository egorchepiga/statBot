import * as types from './actionType';

export const setToken = (data) =>
    dispatch => {
        dispatch({type: types.SET_TOKEN, payload: data})
    };