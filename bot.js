class Bot {

    //sql += 'USE `' + username + '`;' ;

    constructor(TOKEN, OPTIONS) {
        const TelegramBot = require('./telegram-bot/src/telegram');
        this.SHA512 = require('js-sha512');
        this.DB = require('./DB');
        this.fromTime = '';
        this.toTime = '';
        this.SECRET = OPTIONS.secret;
        this.TOKEN = TOKEN;
        this.telegramBot = new TelegramBot(this.TOKEN, OPTIONS);
        this.mainBase = '`' + OPTIONS.mainBase + '`';
    }

    dbName(chatId) {
        return ' `' + chatId + '#telegram`';
    }

    setWebHook(url) {
        return this.telegramBot.setWebHook(url);
    }

    watch() {
        this.telegramBot.on('text', msg => {
            if (msg.from.id === msg.chat.id ) {
                if (msg.text === 'отчёт')
                    this.getStatToken(msg.from.id)
                        .then(res => {
                            if (res.error) console.log(res.error);
                            else this.telegramBot.sendMessage( msg.chat.id,
                                'egorchepiga.ru/chat/local?username=' + msg.from.id + '&token=' + res.result
                            );
                        });
                if (msg.text === 'токен' || msg.text === 'token')
                    this.createStatToken(msg.from.id)
                        .then(res => {
                            this.telegramBot.sendMessage(msg.chat.id, res);
                        });
            } else {
                if (msg.text === '/ownReport') {
                    this.createChat(msg)
                        .then(res => {
                            if (res.error) return {error : res.error, res: null};
                            return this.createUser(msg, this.dbName(msg.from.id));
                        });
                }
                let words = msg.text.split(' ');
                this.updateUsersWords(msg, words).then(res => {
                });
            }
        });



        //download sticker with
        //https://api.telegram.org/file/bot491772305:AAF_X2NSD5Y9IlyHUuS9i9TmbWWrb_mg23E/stickers/file_24.webp
        //https://api.telegram.org/file/botTOKEN/stickers/file_#.webp

        this.telegramBot.on('sticker', msg => {
            if (msg.from.id === msg.chat.id) {
                return {result: null, error: 'PRIVATE_MSG_NOT_ALLOWED'};
            }
            this.telegramBot.getFile(msg.sticker.file_id)
                .then(res => {
                    this.updateUsersWords(msg, [res.file_path]);
                });
        });

        this.telegramBot.on('photo', msg => {
            if (msg.from.id === msg.chat.id) {
                return {result: null, error: ''};
            }
            this.telegramBot.getFile(msg.photo[1].file_id)
                .then(res => {
                    this.updateUsersWords(msg, [res.file_path]);
                });
        });
        

        this.telegramBot.on('message', msg => {
            let username = '';
            try {
                username = msg.new_chat_participant.username;
            } catch (e) {}
                if(username === 'egorchepiga_bot') {
                    this.createChat(msg)
                        .then(res => {
                            if (res.error) return {error : res.error, result: null};
                            return {error : null, result: true};
                        });
                }

        })
}
    stopWatch() {
        this.telegramBot.on('text', msg => {});
        this.telegramBot.on('sticker', msg => {});
        this.telegramBot.on('photo', msg => {});
        this.telegramBot.on('message', msg => {});
    }

    //Получаем список чатов, апдейтим, считаем активность, выплёвываем

    analyze(userId, token, chatId) {
        return this.authorization(userId, token)
            .then(res => {
                if (!res.result || token === 0 ) return {error: `cant authorize ${userId} with ${token}`, result: null};
                    return this.getUserChats(this.dbName(userId))
                        .then(res => {
                            if (res.error) return {error : res.error, result: null};
                            let chatPromises = [];
                            for (let i = 0; i < res.length; i++) {
                                chatPromises.push(this.refreshInfo(res[i], this.dbName(userId)));
                            }
                            return Promise.all(chatPromises)
                        });
            });
    }

    refreshInfo(chatId, db) {
        let chatStats = {};
        return this.updateChatStats(chatId, db)
            .then(res => {
                return (res.error) ?
                    {error : res.error, res: null}
                    : this.getChatStats(chatId, db)
            }).then(res => {
                chatStats.users = res;
                return (res.error) ?
                    {error : res.error, res: null}
                    : this.getChatActivity(chatId, db, this.fromTime, this.toTime)
            }).then(res => {
                chatStats.time = res;
                return (res.error) ?
                    {error : res.error, res: null}
                    : chatStats;
            });
    }

    createChat(msg) {
        let db = this.dbName(msg.from.id);
        let sql =
            'CREATE TABLE ' + db + '.`' + msg.chat.id + '#log` ' +
            '(id int (10) NOT NULL,' +
            'username varchar(120) NOT NULL,' +
            'time DATETIME (6),' +
            'PRIMARY KEY (id));';
        sql +=
            'CREATE TABLE ' + db + '.`' + msg.chat.id + '` ' +
            '(id int (10) NOT NULL,' +
            'username varchar(120) NOT NULL,' +
            'summary int (10),' +
            'PRIMARY KEY (username));';
        sql +=
            'USE ' + this.mainBase + ' ;' +
            'INSERT INTO `ROOMS` (`chat_id`, `database_name`) VALUE (?, ?);';
        return this.DB.transaction(sql,[msg.chat.id, msg.from.id]);
    }

    createUser(msg, db){
        let sql =
            'CREATE TABLE ' + db + '.`' + msg.from.id + '#' + msg.chat.id + '` ' +
            '(word varchar(120) NOT NULL,' +
            'summary int (10) NOT NULL,' +
            'PRIMARY KEY (word));';
        sql +=
            'INSERT INTO ' + db + '.`' + msg.chat.id + '` ' +
            '(`id`,`username`,`summary`) ' +
            'VALUES (?, ?, 0);';

        return this.DB.transaction(sql, [ msg.from.id, msg.from.id + '#' + msg.chat.id]);
    }

    updateUsersWords(msg, words) {
        return this.getUsersWithChat(msg.chat.id)
            .then(res => {
                if (res.error) return {error : res.error, result: null}
                let chatPromises = [];
                for (let i = 0; i < res.rows.length; i++) {
                    let db = this.dbName(res.rows[i].database_name);
                    chatPromises.push(
                         this.updateChatWords(msg, words, db)
                        .then(res => {
                            if(!res.error) return {error : null, result: true};
                            return this.createUser(msg, db)
                                .then(res => {
                                    if(res.error) return {error : res.error, result: null};
                                    return this.updateChatWords(msg, words, db)
                                })
                        })
                    );
                }
                return Promise.all(chatPromises)
            });
    }

    updateChatWords(msg, words, db) {
        let words_buff = words.slice(0),
            table = db +'.`'+ msg.from.id + '#' + msg.chat.id + '` ',
            sql = 'INSERT INTO ' + table + ' (`word`, `summary`) VALUES ( ? , \'1\')';
        words_buff.unshift('Messages count');
        for (let i = 0; i < words_buff.length-1; i++)
            sql += ', ( ? , \'1\')';
        sql += ' ON DUPLICATE KEY UPDATE summary=summary+1;';
        sql += 'INSERT INTO ' + db +'.`'+ msg.chat.id + '#log` ' + 'VALUE (?, ?, NOW() );';
        words_buff.push(msg.message_id, msg.from.id);
        return this.DB.transaction(sql, words_buff)
    }

    //Гененируем запросы для получения инфы об сообщениях из всех
    //юзерских таблиц. Сливаем всё в таблицу чата.

    updateChatStats(chatId, db) {
        let arrUserTables = [];
        return this.DB.query('SELECT * FROM  ' + db + '.`' + chatId + '`;')
            .then(res => {
                if (res.error) return {error : res.error, res: null };
                    else {
                            let sql = 'SELECT summary ' +
                                'FROM ' + db + '.`' + res.rows[0].id + '` ' +
                                'WHERE word = \'Messages count\'';
                            arrUserTables = [{ username : res.rows[0].id }]
                        if (res.rows.length > 1) {
                            sql = `(${sql})`;
                            for (let i = 1; i < res.rows.length; i++){
                                arrUserTables.push( { username : res.rows[i].id });
                                sql += ' UNION ' +
                                    '(SELECT summary ' +
                                    'FROM  ' + db + '.`'  + res.rows[i].id + '` ' +
                                    'WHERE word = \'Messages count\')';
                            }
                        }
                        return this.DB.query(sql)
                    }
            }).then(res => {
                if (res.error) return {error : res.error, res: null}
                else {
                    let sql = '',
                        arrSQLPlaceholder = [];
                    for (let i = 0; i < res.rows.length; i++) {
                        arrUserTables[i].summary = res.rows[i].summary;
                        sql += 'UPDATE  ' + db + '.`'  + chatId + '` ' +
                            'SET summary = ? ' +
                            'WHERE username = ? ;';
                        arrSQLPlaceholder.push(arrUserTables[i].summary);
                        arrSQLPlaceholder.push(arrUserTables[i].id);
                    }
                    return this.DB.transaction(sql, arrSQLPlaceholder)
                }
            });
    }

    getChatStats(chatId, db) {
        return this.DB.query('SELECT * FROM   ' + db + '.`' + chatId + '`;')
            .then(res => {
                if (res.error) return {error : res.error, res: null };
                else {
                    let arr = [];
                    for (let i = 0; i < res.rows.length; i++) {
                        arr.push({
                            username: res.rows[i].id,
                            summary: res.rows[i].summary,
                            id: res.rows[i].id
                        });
                    }
                    return arr;
                }
            })
    }

    getChatActivity(chatId, db, from, to) {
        let sql =
            'SELECT * ' +
            'FROM   ' + db + '.`'  + chatId + '#log` ';
        sql += (from && to) ? `WHERE time > ${from}  AND time < ${to}` : '';
        return this.DB.query(sql)
            .then(res => {
                if (res.error) return {error : res.error, res: null };
                else {
                    let arr = [];
                    for (let i = 0; i < res.rows.length; i++) {
                        arr.push({
                            id: res.rows[i].id,
                            username: res.rows[i].id,
                            time: res.rows[i].time
                        })
                    }
                    return arr;
                }
            });
    }

    getUserChats(baseName) {                                              //перспектива на масштабирование
        return this.DB.query('SHOW TABLES FROM ' + baseName)
            .then(res => {
                if (res.error) return {error : res.error, res: null};
                else {
                    let chats = [];
                    for (let i = 0; i < res.rows.length; i++)
                        chats.push(Object.values(res.rows[i])[0]);
                    return chats.filter(tableName => {                       //проверяем, нету ли # в слове. Если нет, то
                        return (tableName.search(/^[^#]*$/) !== -1)       //search возвращает > 0 (т.к. регулярка совпала
                    });
                }
            });
    }

    getUsersWithChat(chatId) {
        let sql =
            'SELECT database_name ' +
            'FROM `stats`.`ROOMS` ' +
            'WHERE chat_id = ? ;';
        return this.DB.query(sql, [chatId])
            .then(res => {
                if(res.error) return {error: res.error, result: null}
                let length = 0;
                try {
                    length = res.rows.length;
                } catch (e){}
                if (length < 1) return {error: 'DATABASE NOT FOUND. CREATE TOKEN!', result: null}
                return {error: null, rows: res.rows}
            });
    }

    getBaseByChat(chatId, username) {
        let sql =
            'SELECT database_name ' +
            'FROM `stats`.`ROOMS` ' +
            'WHERE chat_id = ? AND database_name = ? ;';
        return this.DB.query(sql, [chatId, username])
            .then(res => {
                if (res.error) return {error: res.error, result: null};
                return {error: res.error, result: res.rows[0]};
            })
    }

    createStatToken (username) {
        let botToken = this.SHA512(new Date() + this.SHA512(username.toString()) + this.SECRET).substring(17, 37);
        let sql =
            'INSERT INTO `stats`.`DATABASES` ' +
            '(`database_name`,`token`) ' +
            'VALUES (?, ?)' +
            'ON DUPLICATE KEY UPDATE token = ?;';
        return this.DB.query(sql, [username, botToken, botToken])
            .then(res => {
                return (res.error) ? {error : res.error, res: null}
                    : this.DB.query(
                        'CREATE DATABASE `' + username + '#telegram`' +
                        'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
                    );
            }).then(res => {
                return botToken;
            });
    }


    authorization(username, token) {
        return this.DB.query('SELECT * FROM `stats`.`DATABASES` WHERE database_name = ? AND token = ?',[username, token])
            .then(res => {
                if (res.error) return {error: res.error, result: null}
                return {error: null, result: (res.rows.length > 0) }
            })
    }

    getStatToken(username) {
                return this.DB.query('SELECT * FROM `stats`.`DATABASES` WHERE database_name = ?',[username])
                    .then(res => {
                        if (res.error) return {error: res.error, result: null};
                        if (res.rows.length < 1) return {error: 'CREATE TOKEN!', result: null};
                        return {error: null, result: res.rows[0].token }
                    })
    }

}

module.exports = {
    Bot: Bot
};

