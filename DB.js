const MYSQL = require('mysql'),
    CONFIG = require('./config'),
    EXPIRES = CONFIG.expires, OPTIONS = {
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
        POOL.getConnection((error, connection) => {
            (error) ? resolve({error: error}) :
                connection.beginTransaction(res => {
                    let queries = sql.split(';'),                             // Разбить строку по точкам с запятыми
                        paramsCount = 0,
                        fromCount = 0;
                    for (let i = 0; i < queries.length-1; i++) {
                        fromCount += paramsCount;
                        paramsCount = queries[i].split('?').length-1;           //узнаём кол-во параметров в запросе
                        let _params = params.slice(fromCount, fromCount + paramsCount);
                        connection.query(queries[i], _params, (error, results, fields) => {
                            if (error) return connection.rollback(() => { resolve({error: error}); });
                        });
                    }
                    connection.commit(function (error) {
                        if (error) return connection.rollback(() => { resolve({error: error}); });
                        resolve({error : null, rows : 'TRANSACTION COMPLITED', result : true});
                    });
                })
        })
    });
}


module.exports = {
    query : query,
    transaction : transaction
}