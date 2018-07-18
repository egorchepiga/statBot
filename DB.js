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


module.exports = {
    query : query,
    transaction : transaction
}

