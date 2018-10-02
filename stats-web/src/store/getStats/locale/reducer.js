import * as types from './actionType'
import locales from '../../../../src/common/locale'

const initialState = {...locales['en']};
export default function locale(state = initialState, action) {
    if (action.type === types.SET_LOCALE && action.payload) {
        return locales[action.payload];
    }
    return state;
}