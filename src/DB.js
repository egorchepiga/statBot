const MYSQL = require('mysql'),
    CONFIG = require('../config'),
    mainBase =  '`' + CONFIG.bot.mainBase + '`',
    EXPIRES = CONFIG.expires,
    OPTIONS = {
        host: CONFIG.db.clients.host,
        port: CONFIG.db.clients.port,
        user: CONFIG.db.clients.user,
        password: CONFIG.db.clients.password,
        database: CONFIG.db.clients.database
    },
    POOL = MYSQL.createPool(OPTIONS);

function query(sql, params) {
    return new Promise(resolve => {
        POOL.getConnection((error, connection) => {
            (error) ? resolve({error: error}) :
                connection.query(sql, params, (error, rows) => {
                    connection.release();
                    resolve({error, rows});
                });
        })
    });
}

function transaction(sql, params) {
    return new Promise(resolve => {
        let resArray = [];
        POOL.getConnection((error, connection) => {
            (error) ? resolve({error: error}) :
                connection.beginTransaction(res => {
                    let queries = sql.split(';'),                             // Разбить строку по точкам с запятыми
                        paramsCount = 0,
                        fromCount = 0;
                    for (let i = 0; i < queries.length-1; i++) {
                        fromCount += paramsCount;
                        paramsCount = queries[i].split('?').length-1;           //узнаём кол-во параметров в запросе
                        let _params = [];
                        try {
                            _params = params.slice(fromCount, fromCount + paramsCount);
                        } catch (e) {}
                        connection.query(queries[i], _params, (error, results, fields) => {
                            if (error) resolve({error, results});
                            resArray.push(results);
                        });
                    }
                    connection.commit(function (error) {
                        connection.release();
                        if (error) resolve({error: error});
                        else resolve({error : null, rows : resArray, result : true});
                    });
                })
        })
    });
}

function setChatPrivacy(chat_id, privacy) {
    let sql = 'UPDATE '+ mainBase + '.`ROOMS` ' +
        'SET private = ? ' +
        'WHERE chat_id = ? ';
    return query(sql, [privacy, chat_id])
}

function isChatPrivate(chat_id) {
    let sql = 'SELECT private FROM '+ mainBase + '.`ROOMS` ' +
        'WHERE chat_id = ? ' +
        'LIMIT 1';
    return query(sql, [chat_id])
        .then(res => {
            if (res.error) return {error : res.error, res: null };
            if (res.rows.length === 0) return false;
            return res.rows[0].private;
        })

}

function findChat(chat_id) {
    return query('SELECT * FROM ' + mainBase +'.`ROOMS` WHERE chat_id = ?',[chat_id]);
}

function createChat(msg, db){
    return isChatPrivate(msg.chat.id, mainBase)
        .then(res => {
            if (res) return {error : 'chat is private!', res: null };
            let sql =
                'CREATE TABLE ' + db + '.`' + msg.chat.id + '#log` ' +
                '(id int (10) NOT NULL,' +
                'user_id varchar(120) NOT NULL,' +
                'username varchar(120) NOT NULL,' +
                'time DATETIME (6),' +
                'PRIMARY KEY (id));';
            sql +=
                'CREATE TABLE ' + db + '.`' + msg.chat.id + '` ' +
                '(id varchar(120) NOT NULL,' +
                'summary int (10) DEFAULT 0,' +
                'username varchar(120),' +
                'top_words varchar(350) NULL,' +
                'top_stickers varchar(350) NULL,' +
                'up_to_date BOOLEAN TRUE,' +
                'PRIMARY KEY (id));';
            sql +=
                'CREATE TABLE ' + db + '.`' + msg.chat.id + '#' + msg.chat.id + '` ' +
                ' (word varchar(120) NOT NULL,' +
                'summary int (10) DEFAULT 1 NOT NULL,' +
                'PRIMARY KEY (word)); ';
            sql +=
                'INSERT INTO '+ mainBase + '.`ROOMS` (`id`, `chat_id`, `database_name`, `chat_name`) VALUE (?, ?, ?, ?);';
            sql +=
                'INSERT INTO '+ db + '.`' + msg.chat.id + '` ' +
                '(`id`,`username`) VALUES (?, ?);';
            return transaction(sql,[msg.chat.id + msg.from.id, msg.chat.id, msg.from.id, msg.chat.title, msg.chat.id, msg.chat.title]);
        });
}

function createUser(msg, db){
    let table = db + '.`' + msg.from.id + '#' + msg.chat.id + '`';
    let sql =
        'CREATE TABLE ' + table +
        ' (word varchar(120) NOT NULL,' +
        'summary int (10) DEFAULT 1 NOT NULL,' +
        'PRIMARY KEY (word)); ';
    sql +=
        'INSERT INTO ' + db + '.`' + msg.chat.id + '` ' +
        '(`id`,`username`) ' +
        'VALUES (?, ?);';
    let username = msg.from.username || msg.from.id;
    return transaction(sql, [ msg.from.id, username ]);
}

function createStatToken(user_id, botToken) {
    let sql =
        'INSERT INTO '+ mainBase +'.`ROOMS` ' +
        '(`database_name`,`token`) ' +
        'VALUES (?, ?)' +
        'ON DUPLICATE KEY UPDATE token = ?;';
    return query(sql, [user_id, botToken, botToken])
}

function createDB(user_id) {
    return query(
        'CREATE DATABASE `' + user_id + '#telegram`' +
        'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
    );
}

function clearBase(base) {
    let sql = 'DROP DATABASE `' + base +'#telegram`;';
    sql += 'DELETE FROM ' + mainBase + '.`ROOMS` ' +
        'WHERE database_name = ?;';
    /*sql += 'DELETE FROM ' + mainBase + '.`DATABASES` ' +
        'WHERE database_name = ?;';*/
    return transaction(sql, [ base, base ]);
}

function clearBannedWords(user_id, chat_id, db, bannedWords) {                //Добавить функционал по редактированию конфига на лету
    let sql = 'DELETE FROM ' + db + '.`' + user_id + '#' + chat_id + '` ' +
        'WHERE word IN ( ?';
    for (let i = 0; i < bannedWords.length - 1; i++)
        sql += ', ?'
    sql += ')';
    return query(sql, bannedWords)
}

function authorize(token) {
    return query('SELECT * FROM ' + mainBase +'.`ROOMS` WHERE token = ?',[token]);
}

function updateUserInfo(chat_id, user_id, file_id, username, up_to_date, db) {
    let sql =
        'UPDATE ' + db + '.`'  + chat_id + '` ' +
        'SET img = ? , username = ?' +
        'WHERE id = ? ;';
    return query(sql, [file_id, username, user_id])
        .then(res => {
            if (up_to_date) return res;
            return chat_id === user_id ?
                updateRoom(chat_id, username)
                : updateTimeLogs(chat_id, username, user_id, db)
        })
}

function updateTimeLogs(chat_id, username, user_id, db) {
    let sql =
        'UPDATE ' + db + '.`'  + chat_id + '#log` ' +
        'SET username = ? ' +
        'WHERE user_id = ? ;';
    return query(sql, [username, user_id])
}

function updateRoom(chat_id, username) {
    let sql =
        'UPDATE ' + mainBase + '.`ROOMS` ' +
        'SET chat_name = ? ' +
        'WHERE chat_id = ? ;';
    return query(sql, [username, chat_id])
}

function updateChatWords(msg, words, db) {
    let words_buff = words.slice(0),
        table = db +'.`'+ msg.from.id + '#' + msg.chat.id + '` ',
        sql = 'INSERT INTO ' + table +
            ' (`word`) VALUES (?)';
    words_buff.unshift('Messages count');
    for (let i = 0; i < words_buff.length-1; i++)
        sql += ', (?)';
    sql += ' ON DUPLICATE KEY UPDATE summary=summary+1;';

    table = db +'.`'+ msg.chat.id + '#' + msg.chat.id + '` ';
    sql += 'INSERT INTO ' + table +
            ' (`word`) VALUES (?)';
    for (let i = 0; i < words_buff.length-1; i++)
        sql += ', (?)';
    sql += ' ON DUPLICATE KEY UPDATE summary=summary+1;';
    words_buff = words_buff.concat(words_buff);

    sql += 'INSERT INTO ' + db +'.`'+ msg.chat.id + '#log` ' + 'VALUE (?, ?, ?, NOW() );';

    words_buff.push(msg.message_id, msg.from.id, msg.from.username);
    return transaction(sql, words_buff)
}

function updateChatTable(promisesAnswers, arrUserTables, chat_id, db) {
    let last = promisesAnswers.length-1;
    if (promisesAnswers[last].error) return {error : promisesAnswers[last].error, res: null}
    let sql = '',
        arrSQLPlaceholder = [],
        j = 0;
    let a = arrUserTables.length;
    for (let i = 0; i < a; i++) {
        arrUserTables[i].summary = promisesAnswers[last].rows[i].summary;
        sql +=
            'UPDATE ' + db + '.`'  + chat_id + '` ' +
            'SET summary = ? , top_words = ? , top_stickers = ? '  +
            'WHERE id = ? ;';
        arrSQLPlaceholder.push(arrUserTables[i].summary);
        arrSQLPlaceholder.push(JSON.stringify(promisesAnswers[j]));
        arrSQLPlaceholder.push(JSON.stringify(promisesAnswers[j+1]));
        arrSQLPlaceholder.push(arrUserTables[i].id);
        j += 2;

    }
    return transaction(sql, arrSQLPlaceholder)
}

function updateChatStats(chat_id, db) {
    let arrUserTables = [];
    return getUsersFromChat(chat_id, db)
        .then(res => {
            if (res.error) return {error : res.error, res: null };
            for (let i = 0; i < res.rows.length; i++)
                arrUserTables.push({ id : res.rows[i].id });
            return getSummaryForUsers(arrUserTables, chat_id, db, mainBase )
        }).then(res => {
            let last = res.length-1;
            if (res[last].error) return {error : res[last].error, res: null}
            return updateChatTable(res, arrUserTables, chat_id, db)
        });
}

// ["бы", "вот", "все", "да", "для", "до",
// "если", "еще", "за", "и", "им", "из",
// "их", "как", "меня", "мне", "мы", "на",
// "не", "нет", "но", "ну", "он", "она",
// "они", "от", "по", "про", "так", "там",
// "тебе", "тебя", "то", "тут", "ты", "уже",
// "что", "же", "это"]

function updateBannedWords(user_id, chat_id, db, bannedWords) {
    let sql = 'UPDATE  ' + db + '.`ROOMS` ' +
        'SET banned_words = ? ' +
        'WHERE chat_id = ? ' +
        'AND database_name = ?';
    return query(sql, [bannedWords, chat_id, user_id])
}

function getBannedWords(chat_id, user_id) {
    return getUsersWithChat(chat_id, mainBase)
        .then(res => {
            for (let i = 0; i < res.rows.length; i++)
                if (res.rows[i].database_name === user_id) {
                    return res.rows[i];
                }
            return {error: `No matching with ${chat_id} and ${user_id}`}
        });
}


function getTopStickers(user_id, chat_id, db, n = 5) {
    let sql =
        'SELECT * FROM   ' + db + '.`' + user_id + '#' + chat_id + '` ' +
        "WHERE word LIKE 'stickers/%'" +
        'GROUP BY summary DESC , word ' +
        'LIMIT ?';
    return query(sql, [n])
        .then(res => {
            if (res.error) return {error : res.error, res: null };
            let obj = {};
            for (let i = 0; i < res.rows.length; i++)
                obj[res.rows[i].word] = res.rows[i].summary;
            return obj;
        })
}


function getChatsNames(arrChatId){
    let sql =
        ' SELECT chat_id, chat_name ' +
        'FROM '+ mainBase + '.`ROOMS` ' +
        'WHERE chat_id IN ( '+ '?,'.repeat(arrChatId.length) +
        '0 )';                                                              //ending after last ','
    return query(sql, arrChatId)
        .then(res => {
            let obj = {};
            for (let i=0; i < res.rows.length; i++){
                obj[res.rows[i].chat_id] = res.rows[i].chat_name;
            }
            return obj;
        })
}

function getSummaryForUsers(arrUserID, chat_id, db) {
    return getUsersWithChat(chat_id, mainBase)
        .then(res => {
            let bannedWords = JSON.parse(res.rows[0].banned_words),
                arrPromises = [],
                arrUserTables = [{ id : arrUserID[0].id }],
                sql = 'SELECT summary ' +
                    'FROM ' + db + '.`' + arrUserID[0].id + '#' + chat_id + '` ' +
                    'WHERE word = \'Messages count\'';
            if(arrUserTables[0].id === chat_id) n = 20;
            arrPromises.push(getTopWords(
                arrUserTables[0].id === chat_id ? 20 : 5,
                arrUserID[0].id, chat_id, db, bannedWords));                   //до
            arrPromises.push(getTopStickers(arrUserID[0].id, chat_id, db, 5));
            if (arrUserID.length > 1) {
                sql = `(${sql})`;
                for (let i = 1; i < arrUserID.length; i++){
                    arrUserTables.push( { id : arrUserID[i].id });
                    sql += ' UNION ' +
                        '(SELECT summary ' +
                        'FROM  ' + db + '.`'  + arrUserID[i].id + '#' + chat_id + '` ' +
                        'WHERE word = \'Messages count\')';
                    arrPromises.push(getTopWords(
                        arrUserTables[i].id === chat_id ? 20 : 5
                        , arrUserTables[i].id, chat_id, db, bannedWords));        //topSize
                    arrPromises.push(getTopStickers(arrUserID[i].id, chat_id, db, 5));
                }
            }
            arrPromises.push(query(sql));
            return Promise.all(arrPromises)
        });
}

function getUserTables(baseName){
    return query('SHOW TABLES FROM ' + baseName)
        .then(res => {
            if (res.error) return {error : res.error, result: null};
            let chats = [];
            for (let i = 0; i < res.rows.length; i++)
                chats.push(Object.values(res.rows[i])[0]);
            return chats.filter(tableName => {                       //проверяем, нету ли # в слове. Если нет, то
                return (tableName.search(/^[^#]*$/) !== -1)       //search возвращает > 0
            });
        });
}

function getUsersWithChat(chatId ) {
    let sql =
        'SELECT database_name, chat_name, banned_words ' +
        'FROM '+ mainBase +'.`ROOMS` ' +
        'WHERE chat_id = ? ;';
    return query(sql, [chatId])
        .then(res => {
            if(res.error) return {error: res.error, result: null}
            let length = 0;
            try {
                length = res.rows.length;
            } catch (e){ console.log(e) }
            if (length < 1) return {error: 'DATABASE NOT FOUND. CREATE TOKEN!', result: null}
            return {error: null, rows: res.rows}
        });
}

function getChatStats(chatId, db) {
    return query('SELECT * FROM   ' + db + '.`' + chatId + '`')
        .then(res => {
            if (res.error) return {error : res.error, result: null };
            let arr = [];
            for (let i = 0; i < res.rows.length; i++)
                arr.push({
                    user: res.rows[i].username,
                    summary: res.rows[i].summary,
                    top_words: JSON.parse(res.rows[i].top_words),
                    top_stickers: JSON.parse(res.rows[i].top_stickers),
                    img : res.rows[i].img,
                    id : res.rows[i].id
                });
            return arr;
        })
}

function getChatActivity(chatId, db, from, to) {
    let sql =
        'SELECT * ' +
        'FROM   ' + db + '.`'  + chatId + '#log` ';
    sql += (from && to) ? `WHERE time > ${from}  AND time < ${to}` : '';
    return query(sql)
        .then(res => {
            if (res.error) return {error : res.error, result: null };
            let arr = [];
            for (let i = 0; i < res.rows.length; i++)
                arr.push({
                    user_id: res.rows[i].user_id,
                    user: res.rows[i].username,
                    time: res.rows[i].time
                })
            return arr;
        });
}

function getTopWords(n, user_id, chat_id, db, bannedWords) {
    return clearBannedWords(user_id, chat_id, db, bannedWords)
        .then(res => {
            if (res.error) return {error: res.error, res: null};
            return getWords(n, user_id, chat_id, db)
        });
}

function getWords(n, user_id, chat_id, db) {
    let sql =
        'SELECT * ' +
        'FROM   ' + db + '.`' + user_id + '#' + chat_id + '` ' +
        "WHERE word NOT LIKE 'stickers/%' " +
        'GROUP BY summary DESC , word ' +
        'LIMIT ?';
    return query(sql, [++n]).then(res => {
        if (res.error) return {error : res.error, res: null };
        let obj = {};
        for (let i = 0; i < res.rows.length; i++)
            obj[res.rows[i].word] = res.rows[i].summary;
        delete obj['Messages count'];
        return obj;
    })
}

function getUsersFromChat(chatId, db) {
    return query('SELECT * FROM  ' + db + '.`' + chatId + '`;')
}

module.exports = {
    createChat : createChat,
    createUser : createUser,
    authorize : authorize,
    updateChatWords : updateChatWords,
    updateBannedWords : updateBannedWords,
    createStatToken : createStatToken,
    createDB : createDB,
    getChatsNames : getChatsNames,
    getUserTables : getUserTables,
    getUsersWithChat : getUsersWithChat,
    getChatStats : getChatStats,
    getChatActivity : getChatActivity,
    getTopWords : getWords,
    updateChatStats : updateChatStats,
    updateUserInfo : updateUserInfo,
    clearBase: clearBase,
    setChatPrivacy: setChatPrivacy,
    isChatPrivate : isChatPrivate,
    getBannedWords : getBannedWords,
    findChat : findChat
};
