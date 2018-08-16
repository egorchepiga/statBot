import * as types from './actionType'

const initialState = {fromTime: "2018-07-01", toTime: "2018-07-05"};
export default function timeFrame(state = initialState, action) {
    switch (action.type) {
        case types.SET_FROM_TIME:
            return Object.assign({}, state, { fromTime: action.payload, toTime: state.toTime})
        case types.SET_TO_TIME:
            return Object.assign({}, state, { fromTime: state.fromTime, toTime: action.payload})
    }
    return state;
}