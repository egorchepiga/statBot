import * as types from './actionType'

export const changeSettings = () => {
    return dispatch => {
        dispatch({type: types.SETTINGS_ACTIVE_CHANGE})
    }
};

export const changeActive = () => {
    return dispatch => {
        dispatch({type: types.MENU_ACTIVE_CHANGE})
    }
};