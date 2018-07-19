class Bot {

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
        this.topSize = parseInt(OPTIONS.topSize) || 5;
    }

    dbName(user_id) {
        return ' `' + user_id + '#telegram`';
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
                botName = msg.new_chat_participant.username;
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

    //Получаем список чатов, апдейтим, считаем активность

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
        return this.DB.authorize(user_id, token, this.mainBase)
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
                    : this.getUsersWithChat(chatId)
            }).then(res => {
                chatStats.name = res.rows[0].chat_name;
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
        return this.DB.createChat(msg, db, this.mainBase );
    }

    createUser(msg, db){
        return this.DB.createUser(msg, db);
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
        return this.DB.updateChatWords(msg, words, db);
    }

    //Гененируем запросы для получения инфы об сообщениях из всех
    //юзерских таблиц. Сливаем всё в таблицу чата.

    updateChatStats(chatId, db) {
        let arrUserTables = [],
            arrPromises = [];
        return this.DB.getUsersFromChat(chatId, db)
            .then(res => {
                if (res.error) return {error : res.error, res: null };
                let sql = 'SELECT summary ' +
                    'FROM ' + db + '.`' + res.rows[0].id + '#' + chatId + '` ' +
                    'WHERE word = \'Messages count\'';
                arrUserTables = [{ id : res.rows[0].id }];
                arrPromises.push(this.getTopWords(this.topSize, res.rows[0].id, chatId, db))
                if (res.rows.length > 1) {
                    sql = `(${sql})`;
                    for (let i = 1; i < res.rows.length; i++){
                        arrUserTables.push( { id : res.rows[i].id });
                        sql += ' UNION ' +
                            '(SELECT summary ' +
                            'FROM  ' + db + '.`'  + res.rows[i].id + '#' + chatId + '` ' +
                            'WHERE word = \'Messages count\')';
                        arrPromises.push(this.getTopWords(this.topSize, arrUserTables[i].id, chatId, db))
                    }
                }
                arrPromises.push(this.DB.query(sql));
                return Promise.all(arrPromises)
            }).then(res => {
                let last = res.length-1;
                if (res[last].error) return {error : res[last].error, res: null}
                let sql = '',
                    arrSQLPlaceholder = [];
                for (let i = 0; i < res[last].rows.length; i++) {
                    arrUserTables[i].summary = res[last].rows[i].summary;
                    sql +=
                        'UPDATE ' + db + '.`'  + chatId + '` ' +
                        'SET summary = ? , top_words = ?' +
                        'WHERE id = ? ;';
                    arrSQLPlaceholder.push(arrUserTables[i].summary);
                    arrSQLPlaceholder.push(JSON.stringify(res[i]));
                    arrSQLPlaceholder.push(arrUserTables[i].id);
                }
                return this.DB.transaction(sql, arrSQLPlaceholder)
            });
    }

    createStatToken (user_id) {
        let botToken = this.SHA512(new Date() + this.SHA512(user_id.toString()) + this.SECRET).substring(17, 37);
        return this.DB.createStatToken(user_id, botToken, this.mainBase)
            .then(res => {
                if (res.error) return {error : res.error, res: null}
                return this.DB.createDB(user_id)
            }).then(res => {
                return botToken;
            });
    }

    getStatToken(user_id) {
        return this.DB.getStatToken(user_id, this.mainBase)
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

    getUserChats(baseName) {
        return this.DB.getUserTables(baseName)
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
        return this.DB.getUsersWithChat(chatId, this.mainBase)
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
        return this.DB.getChatStats(chatId, db)
            .then(res => {
                if (res.error) return {error : res.error, res: null };
                let arr = [];
                for (let i = 0; i < res.rows.length; i++)
                    arr.push({
                        user: res.rows[i].username,
                        summary: res.rows[i].summary,
                        top_words: JSON.parse(res.rows[i].top_words)
                    });
                return arr;
            })
    }

    getChatActivity(chatId, db, from, to) {
        return this.DB.getChatActivity(chatId, db, from, to)
            .then(res => {
                if (res.error) return {error : res.error, res: null };
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

    getTopWords(n, user_id, chat_id, db) {
        return this.DB.getTopWords(n, user_id, chat_id, db)
            .then(res => {
                let obj = {};
                if (res.error) return {error : res.error, res: null };
                for (let i = 0; i < res.rows.length; i++)
                    obj[res.rows[i].word] = res.rows[i].summary;
                return obj;
            })
    }

}

module.exports = {
    Bot: Bot
};

