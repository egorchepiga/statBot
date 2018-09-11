import * as types from './actionType'
export const findUser = (string) =>
    dispatch => {
    dispatch({type: types.FIND_USER, payload: string})
}