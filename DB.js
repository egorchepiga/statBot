const MYSQL = require('mysql'),
    CONFIG = require('./config'),
    EXPIRES = CONFIG.expires,
    OPTIONS = {
    host: CONFIG.db.clients.host,
    port: CONFIG.db.clients.port,
    user: CONFIG.db.clients.user,
    password: CONFIG.db.clients.password,
    database: CONFIG.db.clients.database
},
    POOL = MYSQL.createPool(OPTIONS);
/**
 *
 * @param  sql - sql запрос. В местах подстановке параметров пишется ? (знак "вопрос");
 * @param  params - вставляемый параметр в запрос (массив [ ] параметров по порядку);
 * @return возвращает ответ от БД;
 * @pablic
 */
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

function setChatPrivacy(chat_id, privacy, mainBase) {
    let sql = 'UPDATE '+ mainBase + '.`ROOMS` ' +
        'SET private = ? ' +
        'WHERE chat_id = ? ';
    return query(sql, [privacy, chat_id])
}

function isChatPrivate(chat_id, mainBase) {
    let sql = 'SELECT private FROM '+ mainBase + '.`ROOMS` ' +
        'WHERE chat_id = ? ' +
        'LIMIT 1';
    return query(sql, [chat_id])
        .then(res => {
            if (res.error) return {error : res.error, res: null };
            return res.rows[0].private;
        })

}

function createChat(msg, db, mainBase){
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
                'top_words varchar(250) NULL,' +
                'PRIMARY KEY (id));';
            sql +=
                'INSERT INTO '+ mainBase + '.`ROOMS` (`id`, `chat_id`, `database_name`, `chat_name`) VALUE (?, ?, ?, ?);';
            return transaction(sql,[msg.chat.id + msg.from.id, msg.chat.id, msg.from.id, msg.chat.title]);
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
        'CREATE UNIQUE INDEX ' + table +
        ' ON ' + table + ' (word(8));';
    sql +=
        'INSERT INTO ' + db + '.`' + msg.chat.id + '` ' +
        '(`id`,`username`) ' +
        'VALUES (?, ?);';
    return transaction(sql, [ msg.from.id, msg.from.username ]);
}

function authorize(user_id, token, mainBase) {
    return query('SELECT * FROM ' + mainBase +'.`DATABASES` WHERE database_name = ? AND token = ?',[user_id, token]);
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
    sql += 'INSERT INTO ' + db +'.`'+ msg.chat.id + '#log` ' + 'VALUE (?, ?, ?, NOW() );';
    words_buff.push(msg.message_id, msg.from.id, msg.from.username);
    return transaction(sql, words_buff)
}

function getSummaryForUsers(arrUserID, chat_id, db) {
    let arrPromises = [],
        arrUserTables = [{ id : arrUserID[0].id }];
    let sql = 'SELECT summary ' +
        'FROM ' + db + '.`' + arrUserID[0].id + '#' + chat_id + '` ' +
        'WHERE word = \'Messages count\'';
    arrPromises.push(getTopWords(5, arrUserID[0].id, chat_id, db))
    if (arrUserID.length > 1) {
        sql = `(${sql})`;
        for (let i = 1; i < arrUserID.length; i++){
            arrUserTables.push( { id : arrUserID[i].id });
            sql += ' UNION ' +
                '(SELECT summary ' +
                'FROM  ' + db + '.`'  + arrUserID[i].id + '#' + chat_id + '` ' +
                'WHERE word = \'Messages count\')';
            arrPromises.push(getTopWords(5, arrUserTables[i].id, chat_id, db))        //topSize
        }
    }
    arrPromises.push(query(sql));
    return Promise.all(arrPromises)
}

function updateChatTable(promisesAnswers, arrUserTables, chat_id, db) {
    let last = promisesAnswers.length-1;
    if (promisesAnswers[last].error) return {error : promisesAnswers[last].error, res: null}
    let sql = '',
        arrSQLPlaceholder = [];
    for (let i = 0; i < promisesAnswers[last].rows.length; i++) {
        arrUserTables[i].summary = promisesAnswers[last].rows[i].summary;
        sql +=
            'UPDATE ' + db + '.`'  + chat_id + '` ' +
            'SET summary = ? , top_words = ?' +
            'WHERE id = ? ;';
        arrSQLPlaceholder.push(arrUserTables[i].summary);
        arrSQLPlaceholder.push(JSON.stringify(promisesAnswers[i]));
        arrSQLPlaceholder.push(arrUserTables[i].id);
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
            return getSummaryForUsers(res.rows, chat_id, db )
        }).then(res => {
            let last = res.length-1;
            if (res[last].error) return {error : res[last].error, res: null}
            return updateChatTable(res, arrUserTables, chat_id, db)
        });
}

function createStatToken(user_id, botToken, mainBase) {
    let sql =
        'INSERT INTO '+ mainBase +'.`DATABASES` ' +
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

function getStatToken(user_id, mainBase){
    return query('SELECT * FROM ' + mainBase + '.`DATABASES` WHERE database_name = ?',[user_id])
}

function getUserTables(baseName){
    return query('SHOW TABLES FROM ' + baseName)
}

function getUsersWithChat(chatId, mainBase ) {
    let sql =
        'SELECT database_name, chat_name ' +
        'FROM '+ mainBase +'.`ROOMS` ' +
        'WHERE chat_id = ? ;';
    return query(sql, [chatId])
}

function getChatStats(chatId, db) {
    return query('SELECT * FROM   ' + db + '.`' + chatId + '`')
}

function getChatActivity(chatId, db, from, to) {
    let sql =
        'SELECT * ' +
        'FROM   ' + db + '.`'  + chatId + '#log` ';
    sql += (from && to) ? `WHERE time > ${from}  AND time < ${to}` : '';
    return query(sql)
}

function getTopWords(n, user_id, chat_id, db) {
    let sql =
        'SELECT * ' +
        'FROM   ' + db + '.`' + user_id + '#' + chat_id + '` ' +
        'WHERE word != \'Messages count\'' +
        'GROUP BY summary DESC , word ' +
        'LIMIT ?';
    return query(sql, [n])
        .then(res => {
            let obj = {};
            if (res.error) return {error : res.error, res: null };
            for (let i = 0; i < res.rows.length; i++)
                obj[res.rows[i].word] = res.rows[i].summary;
            return obj;
        })
}

function getUsersFromChat(chatId, db) {
    return query('SELECT * FROM  ' + db + '.`' + chatId + '`;')
}

function clearBase(base, mainbase) {
    let sql = 'DROP DATABASE `' + base +'#telegram`;'
    sql += 'DELETE FROM ' + mainbase + '.`ROOMS` ' +
        'WHERE database_name = ?;';
    sql += 'DELETE FROM ' + mainbase + '.`DATABASES` ' +
        'WHERE database_name = ?;';
    console.log(sql);
    return transaction(sql, [ base, base ]);
}

module.exports = {
    createChat : createChat,
    createUser : createUser,
    authorize : authorize,
    updateChatWords : updateChatWords,
    createStatToken : createStatToken,
    createDB : createDB,
    getStatToken : getStatToken,
    getUserTables : getUserTables,
    getUsersWithChat : getUsersWithChat,
    getChatStats : getChatStats,
    getChatActivity : getChatActivity,
    updateChatStats : updateChatStats,
    clearBase: clearBase,
    setChatPrivacy: setChatPrivacy,
    isChatPrivate : isChatPrivate
}

