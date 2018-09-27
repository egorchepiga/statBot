import * as types from './actionType'
export const updateBannedWords = ({token, admToken, chat_id, banned_words}) =>
    dispatch => {
        let arr = [];
        for(let key in banned_words)
            arr.push(banned_words[key]);
        fetch(`https://egorchepiga.ru/tg-stats/banned/?token=${token}&adm=${admToken}&chat_id=${chat_id}&banned=${JSON.stringify(arr)}`, {
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: "GET"
        }).then(response => {
            dispatch({type: types.SAVE_INPUT, payload: banned_words});
        }).catch((er) => {
            console.log("Error: ",er)
        });
    };

    /*
        структура которую отправляешь в SAVE_INPUT 
        {list: []}
        т.е. в list пихаешь массив слов
    */