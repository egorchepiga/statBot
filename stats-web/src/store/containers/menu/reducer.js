import * as types from './actionType'
const initialState = {active: true, settings : false};
export default function menu(state = initialState, action) {

    if (action.type === types.MENU_ACTIVE_CHANGE)
        return {...state, active: !state.active};
    else if (action.type === types.SETTINGS_ACTIVE_CHANGE)
        return {...state, settings: !state.settings};
    return state;
}