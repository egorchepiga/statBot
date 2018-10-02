import * as types from './actionType';

export const changeLocale = (locale) =>
    dispatch => {
        dispatch({type: types.SET_LOCALE, payload: locale})
    };