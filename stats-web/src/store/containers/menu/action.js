import * as types from './actionType'

export const setNavigation = (nav) => {
    return dispatch => {
        dispatch({type: types.MENU_NAV_CHANGE, payload : nav})
    }
};

export const changeActive = () => {
    return dispatch => {
        dispatch({type: types.MENU_ACTIVE_CHANGE})
    }
};