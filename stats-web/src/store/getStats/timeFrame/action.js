import * as types from './actionType';

export const setTimeFrame = (data) =>
    dispatch => {
        dispatch({type: types.SET_TIMEFRAME, payload: data});
    };

export const setFromTime = (data) =>
    dispatch => {
        dispatch({type: types.SET_FROM_TIME, payload: data});
    };

export const setToTime = (data) =>
    dispatch => {
        dispatch({type: types.SET_TO_TIME, payload: data});
    };