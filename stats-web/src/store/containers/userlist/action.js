import * as types from './actionType'

export const findUser = (string) =>
    dispatch => {
    dispatch({type: types.FIND_USER, payload: string})
};

export const showAll = () =>
    dispatch => {
        dispatch({type: types.SHOW_ALL})
};