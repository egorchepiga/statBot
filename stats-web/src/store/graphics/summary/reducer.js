import * as types from './actionType'


const initialState = {
    graphic : {},
    dayScale : "0",
    topSwitch : true
};

export default function summaryGraphic(state = initialState, action) {
    if (action.type === types.SET_FIRST_DATA) {
        return {
            theme : action.payload.theme,
            topSwitch: action.payload.topSwitch,
            dayScale : action.payload.dayScale,
            graphic : {
                options: state.options,
                data: action.payload
            }
        };
    } else if (action.type === types.SET_FIRST_OPTIONS) {
        return {
            ...state,
            graphic : {
                data: state.data,
                options: action.payload
            }
        };
    }
    return state;
}