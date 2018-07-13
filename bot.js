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

    setWebHook(url) {
        return this.telegramBot.setWebHook(url);
    }

    watch() {
        this.telegramBot.on('text', msg => {
            if (msg.from.id === msg.chat.id ) {
                if (msg.text === 'отчёт')
                    this.getStatToken(msg.from)
                        .then(res => {
                            if (res.error) console.log(res.error);
                            else this.telegramBot.sendMessage( msg.chat.id,
                                'egorchepiga.ru/chat/local?username=' + msg.from + '&token=' + res.result
                            );
                        });
                if (msg.text === 'токен' || msg.text === 'token')
                    this.createStatToken(msg.from)
                        .then(res => {
                            console.log(res);
                            this.telegramBot.sendMessage(msg.chat.id, res);
                        });
            } else {
                if (msg.text === '/ownReport') {
                    return this.switchBaseByUsername(msg.from)
                        .then(res => {
                            if (res.error) return {error : res.error, res: null};
                            return this.createChat(msg)
                        }).then(res => {
                            if (res.error) return {error : res.error, res: null};
                            return this.createUser(msg);
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
            this.telegramBot.getFile(msg.photo[3].file_id)
                .then(res => {
                    this.updateUsersWords(msg, [res.file_path]);
                });
        });
        

        this.telegramBot.on('message', msg => {
            console.log(msg);
            try {
                if(msg.new_chat_participant === 'egorchepiga_bot') {
                    return this.switchBaseByUsername(msg.from)
                        .then(res => {
                            if (res.error) return {error : res.error, res: null};
                            return this.createChat(msg)
                        }).then(res => {
                            if (res.error) return {error : res.error, res: null};
                            return this.createUser(msg);
                        });
                    }
                } catch (e) {
                
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

    analyze(username, token, chatId) {
        return this.authorization(username, token)
            .then(res => {
                if (!res.result || token === 0 ) return {error: `cant authorize ${username} with ${token}`, result: null};
                return this.switchBaseByUsername(username).then(res => {
                    if (res.error) return {error : res.error, res: null};
                    if (chatId) return this.refreshInfo(chatId);
                    return this.getUserChats(res.baseName)
                        .then(res => {
                            if (res.error) return {error : res.error, res: null};
                            let chatPromises = [];
                            for (let i = 0; i < res.length; i++) {
                                chatPromises.push(this.refreshInfo(res[i]));
                            }
                            return Promise.all(chatPromises)
                        });
                });
            });
    }

    refreshInfo(chatId) {
        let chatStats = {};
        return this.updateChatStats(chatId)
            .then(res => {
                return (res.error) ?
                    {error : res.error, res: null}
                    : this.getChatStats(chatId)
            }).then(res => {
                chatStats.users = res;
                return (res.error) ?
                    {error : res.error, res: null}
                    : this.getChatActivity(chatId, this.fromTime, this.toTime)
            }).then(res => {
                chatStats.time = res;
                return (res.error) ?
                    {error : res.error, res: null}
                    : chatStats;
            });
    }

    createChat(msg) {
        let sql =
            'CREATE TABLE `' + msg.chat.id + '#log` ' +
            '(id int (10) NOT NULL,' +
            'username varchar(120) NOT NULL,' +
            'time DATETIME (6),' +
            'PRIMARY KEY (id));';
        sql +=
            'CREATE TABLE `' + msg.chat.id + '` ' +
            '(id int (10) NOT NULL,' +
            'username varchar(120) NOT NULL,' +
            'summary int (10),' +
            'PRIMARY KEY (username));';
        sql +=
            'USE ' + this.mainBase + ' ;' +
            'INSERT INTO `ROOMS` (`chat_id`, `database_name`) VALUE (?, ?);';
        return this.DB.transaction(sql,[msg.chat.id, msg.from])
            .then(res => {

                if (res.error) return {error : res.error, res: null};
                return this.switchBaseByChat(msg.chat.id, msg.from)                     //!!!!!!!!!!!!!!!!!1
            })
    }

    createUser(msg){
        let sql =
            'CREATE TABLE `' + msg.from + '#' + msg.chat.id + '` ' +
            '(word varchar(120) NOT NULL,' +
            'summary int (10) NOT NULL,' +
            'PRIMARY KEY (word));';
        sql +=
            'INSERT INTO `' + msg.chat.id + '` ' +
            '(`id`,`username`,`summary`) ' +
            'VALUES (?, ?, 0);';

        return this.DB.transaction(sql, [ msg.from.id, msg.from + '#' + msg.chat.id]);
    }

    updateAllWords(msg, words) {
        return this.getUsersWithChat(msg.chat.id)
            .then(res => {
                let chatPromises = [];
                for (let i = 0; i < res.rows.length; i++) {
                    chatPromises.push(this.refreshInfo(res.rows[i]));
                }
                return Promise.all(chatPromises)
            })
    }

    updateUsersWords(msg, words) {
        return this.getUsersWithChat(msg.chat.id)
            .then(res => {
                if (res.error) return {error : res.error, res: null}
                let chatPromises = [];
                for (let i = 0; i < res.rows.length; i++) {
                    chatPromises.push(
                        this.switchBaseByChat(msg.chat.id, res.rows[i].database_name)
                        .then(() => this.updateChatWords(msg, words)));
                }
                return Promise.all(chatPromises)
            });
    }

    updateChatWords(msg, words) {
        let words_buff = words.slice(' '),
            table = ' `'+ msg.from + '#' + msg.chat.id + '` ',
            sql = 'INSERT INTO ' + table + ' (`word`, `summary`) VALUES ( ? , \'1\')';
        words_buff.unshift('Messages count');
        for (let i = 0; i < words_buff.length-1; i++)
            sql += ', ( ? , \'1\')';
        sql += ' ON DUPLICATE KEY UPDATE summary=summary+1;';
        sql += 'INSERT INTO `' + msg.chat.id + '#log` ' + 'VALUE (?, ?, NOW() );';
        words_buff.push(msg.message_id, msg.from);
        return this.DB.transaction(sql, words_buff)
    }

    //Гененируем запросы для получения инфы об сообщениях из всех
    //юзерских таблиц. Сливаем всё в таблицу чата.

    updateChatStats(chatId) {
        let arrUserTables = [];
        return this.DB.query('SELECT * FROM  `' + chatId + '`;')
            .then(res => {
                if (res.error) return {error : res.error, res: null };
                    else {
                            let sql = 'SELECT summary ' +
                                'FROM `' + res.rows[0] + '` ' +
                                'WHERE word = \'Messages count\'';
                            arrUserTables = [{ username : res.rows[0] }]
                        if (res.rows.length > 1) {
                            sql = `(${sql})`;
                            for (let i = 1; i < res.rows.length; i++){
                                arrUserTables.push( { username : res.rows[i] });
                                sql += ' UNION ' +
                                    '(SELECT summary ' +
                                    'FROM `' + res.rows[i] + '` ' +
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
                        sql += 'UPDATE `' + chatId + '` ' +
                            'SET summary = ? ' +
                            'WHERE username = ? ;';
                        arrSQLPlaceholder.push(arrUserTables[i].summary);
                        arrSQLPlaceholder.push(arrUserTables[i]);
                    }
                    return this.DB.transaction(sql, arrSQLPlaceholder)
                }
            });
    }

    getChatStats(chatId) {
        return this.DB.query('SELECT * FROM  `' + chatId + '`;')
            .then(res => {
                if (res.error) return {error : res.error, res: null };
                else {
                    let arr = [];
                    for (let i = 0; i < res.rows.length; i++) {
                        arr.push({
                            username: res.rows[i],
                            summary: res.rows[i].summary,
                            id: res.rows[i].id
                        });
                    }
                    return arr;
                }
            })
    }

    getChatActivity(chatId, from, to) {
        let sql =
            'SELECT * ' +
            'FROM  `' + chatId + '#log` ';
        sql += (from && to) ? `WHERE time > ${from}  AND time < ${to}` : '';
        return this.DB.query(sql)
            .then(res => {
                if (res.error) return {error : res.error, res: null };
                else {
                    let arr = [];
                    for (let i = 0; i < res.rows.length; i++) {
                        arr.push({
                            id: res.rows[i].id,
                            username: res.rows[i],
                            time: res.rows[i].time
                        })
                    }
                    return arr;
                }
            });
    }

    getUserChats(baseName) {                                              //перспектива на масштабирование
        return this.DB.query('SHOW TABLES FROM `' + baseName +'`')
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
        let sql = 'USE ' + this.mainBase;
        return this.DB.query(sql)
            .then(res => {
                if (res.error) return {error: res.error, result: null};
                sql =
                    'SELECT database_name ' +
                    'FROM ROOMS ' +
                    'WHERE chat_id = ? ;';
                return this.DB.query(sql, [chatId])
            }).then(res => {
                if (res.rows.length < 1) return {error: 'DATABASE NOT FOUND. CREATE TOKEN!', result: null}
                return {error: null, rows: res.rows}
            })
    }

    switchBaseByChat(chatId, username) {
        let sql = 'USE ' + this.mainBase;
        return this.DB.query(sql)
            .then(res => {
                if (res.error) return {error: res.error, result: null};
                if (res.rows.length < 1) return {error: 'DATABASE NOT FOUND. CREATE TOKEN!', result: null}
                sql =
                    'SELECT database_name ' +
                    'FROM ROOMS ' +
                    'WHERE chat_id = ? AND database_name = ? ;';
                return this.DB.query(sql, [chatId, username])
            }).then(res => {
                if (res.error) return {error: res.error, result: null};
                return this.switchBaseByUsername(res.rows[0].database_name);
            })
    }

    switchBaseByUsername(username) {
        return this.DB.query('USE `' + username + '#telegram`;')
            .then(res => {
                if (res.error) return {error: res.error, result: null};
                return {error: null, baseName: username + '#telegram'};
            })
    }

    createStatToken (username) {
        let botToken = this.SHA512(new Date() + this.SHA512(username) + this.SECRET).substring(17, 37);
        let sql =
            'INSERT INTO `DATABASES` ' +
            '(`database_name`,`token`) ' +
            'VALUES (?, ?)' +
            'ON DUPLICATE KEY UPDATE token = ?;';
        return this.DB.query(sql, [username, botToken, botToken])
            .then(res => {
                return (res.error) ? {error : res.error, res: null}
                    : this.DB.query('CREATE DATABASE `' + username + '#telegram`');
            }).then(res => {
                return botToken;
            });
    }


    authorization(username, token) {
        return this.DB.query('USE ' + this.mainBase + ' ;')
            .then(res => {
                if (res.error) return {error: res.error, result: null}
                return this.DB.query('SELECT * FROM `DATABASES` WHERE database_name = ? AND token = ?',[username, token])
            }).then(res => {
                if (res.error) return {error: res.error, result: null}
                return {error: null, result: (res.rows.length > 0) }
            })
    }

    getStatToken(username) {
        return this.DB.query('USE ' + this.mainBase + ' ;')
            .then(res => {
                if (res.error) return {error: res.error, result: null}
                return this.DB.query('SELECT * FROM `DATABASES` WHERE database_name = ?',[username])
            }).then(res => {
                if (res.error) return {error: res.error, result: null};
                if (res.rows.length < 1) return {error: 'CREATE TOKEN!', result: null};
                return {error: null, result: res.rows[0].token }
            })
    }

}

module.exports = {
    Bot: Bot
};

process.on('uncaughtException', function(err) {
    console.log(err);
});

