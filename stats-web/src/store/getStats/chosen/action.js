import * as types from './actionType';

export const setChosen = (username) =>
    dispatch => {
        dispatch({type: types.CHOOSE, payload: username});
    };
