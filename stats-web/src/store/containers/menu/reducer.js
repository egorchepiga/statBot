import * as types from './actionType'
const initialState = {active: false, nav:[]};
export default function menu(state = initialState, action) {

    if (action.type === types.MENU_ACTIVE_CHANGE) {
        state.active = !state.active;
        return Object.create(state);
    }

    if (action.type === types.MENU_NAV_CHANGE) {
        state.nav = action.payload;
        return Object.create(state);
    }
    return state;
}