class Bot {

    //sql += 'USE `' + user_id + '`;' ;

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
                                'egorchepiga.ru/chat/local?user_id=' + msg.from.id + '&token=' + res.result
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

        //Ивент, при добавлении бота в группу
        this.telegramBot.on('message', msg => {
            let botName = '';
            try {
                botName = msg.new_chat_participant.user_id;
            } catch (e) {}
            if(botName === 'egorchepiga_bot') {
                this.createChat(msg)
                    .then(res => {
                        if (res.error) return {error : res.error, result: null};
                        return {error : null, result: true};
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
    }

    stopWatch() {
        this.telegramBot.on('text', msg => {});
        this.telegramBot.on('sticker', msg => {});
        this.telegramBot.on('photo', msg => {});
        this.telegramBot.on('message', msg => {});
    }

    //Получаем список чатов, апдейтим, считаем активность, выплёвываем

    analyze(user_id, token, chatId) {
        return this.authorization(user_id, token)
            .then(res => {
                if (!res.result || token === 0 ) return {error: `cant authorize ${user_id} with ${token}`, result: null};
                    return this.getUserChats(this.dbName(user_id))
                        .then(res => {
                            if (res.error) return {error : res.error, result: null};
                            let chatPromises = [];
                            for (let i = 0; i < res.length; i++)
                                chatPromises.push(this.refreshInfo(res[i], this.dbName(user_id)));
                            return Promise.all(chatPromises)
                        });
            });
    }

    authorization(user_id, token) {
        return this.DB.query('SELECT * FROM ' + this.mainBase +'.`DATABASES` WHERE database_name = ? AND token = ?',[user_id, token])
            .then(res => {
                if (res.error) return {error: res.error, result: null}
                return {error: null, result: (res.rows.length > 0) }
            })
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
            'user_id varchar(120) NOT NULL,' +
            'time DATETIME (6),' +
            'PRIMARY KEY (id));';
        sql +=
            'CREATE TABLE ' + db + '.`' + msg.chat.id + '` ' +
            '(id int (10) NOT NULL,' +
            'user_id varchar(120) NOT NULL,' +
            'summary int (10),' +
            'PRIMARY KEY (user_id));';
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
            '(`id`,`user_id`,`summary`) ' +
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
                let sql = 'SELECT summary ' +
                    'FROM ' + db + '.`' + res.rows[0].id + '#' + chatId + '` ' +
                    'WHERE word = \'Messages count\'';
                arrUserTables = [{ user_id : res.rows[0].id }];
                if (res.rows.length > 1) {
                    sql = `(${sql})`;
                    for (let i = 1; i < res.rows.length; i++){
                        arrUserTables.push( { user_id : res.rows[i].id });
                        sql += ' UNION ' +
                            '(SELECT summary ' +
                            'FROM  ' + db + '.`'  + res.rows[i].id + '#' + chatId + '` ' +
                            'WHERE word = \'Messages count\')';
                    }
                }
                return this.DB.query(sql)
            }).then(res => {
                if (res.error) return {error : res.error, res: null}
                let sql = '',
                    arrSQLPlaceholder = [];
                for (let i = 0; i < res.rows.length; i++) {
                    arrUserTables[i].summary = res.rows[i].summary;
                    sql += 'UPDATE  ' + db + '.`'  + chatId + '` ' +
                        'SET summary = ? ' +
                        'WHERE user_id = ? ;';
                    arrSQLPlaceholder.push(arrUserTables[i].summary);
                    arrSQLPlaceholder.push(arrUserTables[i].id);
                }
                return this.DB.transaction(sql, arrSQLPlaceholder)
            });
    }

    createStatToken (user_id) {
        let botToken = this.SHA512(new Date() + this.SHA512(user_id.toString()) + this.SECRET).substring(17, 37);
        let sql =
            'INSERT INTO '+ this.mainBase +'.`DATABASES` ' +
            '(`database_name`,`token`) ' +
            'VALUES (?, ?)' +
            'ON DUPLICATE KEY UPDATE token = ?;';
        return this.DB.query(sql, [user_id, botToken, botToken])
            .then(res => {
                if (res.error) return {error : res.error, res: null}
                return this.DB.query(
                    'CREATE DATABASE `' + user_id + '#telegram`' +
                    'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'
                );
            }).then(res => {
                return botToken;
            });
    }

    getStatToken(user_id) {
        return this.DB.query('SELECT * FROM ' + this.mainBase + '.`DATABASES` WHERE database_name = ?',[user_id])
            .then(res => {
                if (res.error) return {error: res.error, result: null};
                let length = 0;
                try {
                    length = res.rows.length;
                } catch (e){ console.log(e) }
                if (length < 1) return {error: 'CREATE TOKEN!', result: null};
                return {error: null, result: res.rows[0].token }
            })
    }

    getUserChats(baseName) {                                              //перспектива на масштабирование
        return this.DB.query('SHOW TABLES FROM ' + baseName)
            .then(res => {
                if (res.error) return {error : res.error, res: null};
                let chats = [];
                for (let i = 0; i < res.rows.length; i++)
                    chats.push(Object.values(res.rows[i])[0]);
                return chats.filter(tableName => {                       //проверяем, нету ли # в слове. Если нет, то
                    return (tableName.search(/^[^#]*$/) !== -1)       //search возвращает > 0 (т.к. регулярка совпала
                });
            });
    }

    getUsersWithChat(chatId) {
        let sql =
            'SELECT database_name ' +
            'FROM '+ this.mainBase +'.`ROOMS` ' +
            'WHERE chat_id = ? ;';
        return this.DB.query(sql, [chatId])
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

    getChatStats(chatId, db) {
        return this.DB.query('SELECT * FROM   ' + db + '.`' + chatId + '`;')
            .then(res => {
                if (res.error) return {error : res.error, res: null };
                let arr = [];
                for (let i = 0; i < res.rows.length; i++)
                    arr.push({
                        user_id: res.rows[i].id,
                        summary: res.rows[i].summary,
                        id: res.rows[i].id
                    });
                return arr;
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
                let arr = [];
                for (let i = 0; i < res.rows.length; i++)
                    arr.push({
                        id: res.rows[i].id,
                        user_id: res.rows[i].id,
                        time: res.rows[i].time
                    })
                return arr;
            });
    }

}

module.exports = {
    Bot: Bot
};

