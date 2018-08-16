import * as types from './actionType'


const initialState = {};

export default function summaryGraphic(state = initialState, action) {
    if (action.type === types.SET_FIRST_DATA) {
        return {
            options: state.options,
            data: action.payload
        };
    } else if (action.type === types.SET_FIRST_OPTIONS) {
        return {
            data: state.data,
            options: action.payload
        };
    }
    return state;
}