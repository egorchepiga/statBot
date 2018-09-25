export const updateBannedWords = ({token, chat_id, banned_words}) =>
    dispatch => {
        fetch(`https://egorchepiga.ru/tg-stats/banned/?token=${token}&chat_id=${chat_id}&banned=${banned_words}`, {
            headers: {
                'Accept': 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: "GET"
        }).then(async response => {
            dispatch({type: chatTypes.SET_BANNED_WORDS, payload: await response.json()});
        }).catch((er) => {
            console.log("Error: ",er)
        });
    };