class Bot {

    constructor(TOKEN, OPTIONS) {
        const TelegramBot = require('../telegram-bot/src/telegram');
        this.SHA512 = require('js-sha512');
        this.DB = require('./DB');
        this.fromTime = '';
        this.toTime = '';
        this.SECRET = OPTIONS.secret;
        this.TOKEN = TOKEN;
        this.telegramBot = new TelegramBot(this.TOKEN, OPTIONS);
        this.topSize = parseInt(OPTIONS.topSize) || 5;
    }

    dbName(user_id) {
        return ' `' + user_id + '#telegram`';
    }

    setWebHook(url) {
        return this.telegramBot.setWebHook(url);
    }

    watch() {
        let self = this;

        this.telegramBot.on('callback_query', function (msg) {
            if (msg.data === 'отчёт')
            self.createStatToken(msg.from.id)
                .then(res => {
                    if (res.error) console.log(res.error);
                    let link = 'https://egorchepiga.ru/?token=' + res;
                    this.answerCallbackQuery(msg.id, link, true);
                    this.sendMessage( msg.message.chat.id, link);
                });
            else if (msg.data === 'обнулить') {
                self.renewBase(msg.from.id)
                    .then(res => {
                        if (res.error) return({error : res.error, result: null});
                        let link = 'https://egorchepiga.ru/?token=' + res;
                        this.answerCallbackQuery(msg.id, link, false);
                        this.sendMessage(  msg.message.chat.id, 'Для наблюдения за группой повторите добавление' +
                            'в неё бота, или прикажите /report в нужной группе.')
                            .then(res => {
                                this.sendMessage(msg.message.chat.id, 'Новая ссылка на отчёт: \n' + link)
                            });
                })
            }
        });

        this.telegramBot.on('text', msg => {
            if (msg.from.id === msg.chat.id) {
                if(msg.text === '/start') {
                    this.createStatToken(msg.from.id)
                        .then(res => {
                            let options = {
                                reply_markup: JSON.stringify({
                                    inline_keyboard: [
                                        [
                                            {text: 'Отчёт', callback_data: 'отчёт'},
                                            {text: 'Обнулить отчёт', callback_data: 'обнулить'}
                                        ]
                                    ]
                                })
                            };
                            if (res.error) console.log({error : res.error, result: null})
                            this.telegramBot.sendMessage( msg.chat.id,
                                'Добавьте бота в группу для учёта её статистики. \n')
                                .then(res => {
                                    this.telegramBot.sendMessage( msg.chat.id,
                                        'Если бот уже находится в группе, вы можете начать формировать свою статистику приказав боту /report. \n')
                                        .then(res => {
                                            this.telegramBot.sendMessage( msg.chat.id,
                                                'Для получения отчёта или его обнуления, воспользуйтесь кнопками ниже. \n' +
                                                'При обнулении отчёта ссылка на него будет заменена.\n' +
                                                'Приятного пользования!', options);
                                        });
                                });
                        });
                }
            } else if(msg.entities) {
                if (msg.text.indexOf('/report@egorchepiga_bot') !== -1) {
                    this.DB.isChatPrivate(msg.chat.id)
                        .then(res => {
                            if (res) {
                                return this.telegramBot.getChatMember(msg.chat.id, msg.from.id)
                                    .then(function(data) {
                                        if ((data.status === "creator") /*|| (data.status == "administrator")*/)
                                            return self.createChat(msg)
                                                .then(res => {
                                                    if (res.error) return {error: res.error, result: null};
                                                    return self.createUser(msg, self.dbName(msg.from.id));
                                                });
                                        self.telegramBot.sendMessage(msg.chat.id, 'Аналитика разрешена только для администрации.\n' +
                                            'Проверьте настройки приватности бота /privacy.');
                                    });
                            }
                            else return this.createChat(msg)
                                .then(res => {
                                    if (res.error) return {error: res.error, result: null};
                                    return this.createUser(msg, this.dbName(msg.from.id));
                                });
                        });
                } else if (msg.text.indexOf('/privacy@egorchepiga_bot') !== -1) {
                    this.telegramBot.getChatMember(msg.chat.id, msg.from.id)
                        .then(function(data) {
                            if ((data.status === "creator") /*|| (data.status == "administrator")*/){
                                self.DB.isChatPrivate(msg.chat.id)
                                    .then(res => {
                                        res = !res;
                                        let str = (res) ? 'Защита активирована.' : 'Защита деактивирована.';
                                        self.DB.setChatPrivacy(msg.chat.id, res);
                                        self.telegramBot.sendMessage( msg.chat.id, str);
                                    });
                            } else self.telegramBot.sendMessage( msg.chat.id, 'Изменение настроек разрешено только для администрации.');
                    });
                }
            } else {
                let words = msg.text.split(/[^a-zA-Zа-яА-Я]/)
                    .filter(word => {
                        return (word !== '' && word.length > 1)
                    }).map(word => {
                        return word.toLowerCase();
                    });
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

/*        this.telegramBot.on('photo', msg => {
            if (msg.from.id === msg.chat.id) {
                return {result: null, error: ''};
            }
            this.telegramBot.getFile(msg.photo[1].file_id)
                .then(res => {
                    this.updateUsersWords(msg, [res.file_path]);
                });
        });*/
    }

    stopWatch() {
        this.telegramBot.on('text', msg => {});
        this.telegramBot.on('sticker', msg => {});
        this.telegramBot.on('photo', msg => {});
        this.telegramBot.on('message', msg => {});
    }

    analyze(token) {
        return this.authorization(token)
            .then(res => {
                if (!res.result || token === 0 ) return {error: `cant authorize with ${token}`, result: null};
                let user_id = res.result[0].database_name ;
                return this.getUserChats(this.dbName(user_id))
                    .then(res => {
                        if (res.error) return {error : res.error, result: null};
                        let chatPromises = [];
                        for (let i = 0; i < res.length; i++)
                            chatPromises.push(this.refreshInfo(res[i], user_id));
                        return Promise.all(chatPromises)
                    });
            });
    }

    loadChat(token, chat_id){
        return this.authorization(token)
            .then(res => {
                if (!res.result || token === 0) return {error: `cant authorize with ${token}`, result: null};
                let user_id = res.result[0].database_name ;
                return this.refreshInfo(chat_id, user_id)
            });
    }

    authorization(token) {
        return this.DB.authorize(token)
            .then(res => {
                if (res.error || res.rows.length === 0) return {error: res.error, result: null};
                return {error: null, result: res.rows }
            })
    }

    refreshInfo(chat_id, user_id) {
        let db = this.dbName(user_id);
        let chatStats = {};
        return this.updateChatStats(chat_id, db)
            .then(res => {
                if (res.error) return {error : res.error, result: null};
                return this.getBannedWords(chat_id, user_id)
            }).then(res => {
                if (res.error) return {error : res.error, result: null};
                chatStats.id = chat_id;
                chatStats.name = res.chat_name;
                chatStats.bannedWords = res.banned_words;
                return this.getChatStats(chat_id, db)
            }).then(res => {
                if (res.error) return {error : res.error, result: null};
                chatStats.chat = res[0];
                res.splice(0,1);
                chatStats.users = res;
                return this.getChatActivity(chat_id, db, this.fromTime, this.toTime)
            }).then(res => {
                if (res.error) return {error : res.error, result: null};
                chatStats.time = res;
                return chatStats;
            });
    }

    renewBase(base) {
        return this.DB.clearBase(base)
            .then(res => {
                if (res.error) return {error: res.error, result: null};
                return this.createStatToken(base)
            }).then(res => {
                if (res.error) return {error: res.error, result: null}
                return res
            });
    }

    createChat(msg) {
        let db = this.dbName(msg.from.id);
        return this.DB.createChat(msg, db );
    }

    createUser(msg, db){
        return this.DB.createUser(msg, db);
    }

    createStatToken (user_id) {
        let botToken = this.SHA512(new Date() + this.SHA512(user_id.toString()) + this.SECRET).substring(17, 37);
        return this.DB.createStatToken(user_id, botToken)
            .then(res => {
                if (res.error) return {error : res.error, result: null}
                return this.DB.createDB(user_id)
            }).then(res => {
                if (res.error) return {error : res.error, result: null}
                return botToken;
            });
    }

    updateUsersWords(msg, words) {
        return this.getUsersWithChat(msg.chat.id)
            .then(res => {
                if (res.error) return {error : res.error, result: null}
                let chatPromises = [];
                for (let i = 0; i < res.rows.length; i++) {
                    let db = this.dbName(res.rows[i].database_name);;
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

    updateChatStats(chat_id, db) {
        return this.DB.updateChatStats(chat_id, db)
    }

    updateBannedWords(token, chat_id, bannedWords){
        return this.authorization(token)
            .then(res => {
                if (!res.result || token === 0) return {error: `cant authorize with ${token}`, result: null};
                let user_id = res.result[0].database_name;
                return this.DB.updateBannedWords(user_id, chat_id, bannedWords)
            });
    }

    getBannedWords(chat_id, user_id){                                                                   //also returns chat_name
        return this.DB.getBannedWords(chat_id, user_id)
    }

    getChats(token){
        return this.authorization(token)
            .then(res => {
                if (!res.result || token === 0) return {error: `cant authorize with ${token}`, result: null};
                let user_id = res.result[0].database_name;
                return this.getUserChats(this.dbName(user_id))
            }).then(res => {
                return this.DB.getChatsNames(res)
            });
    }

    getUserChats(baseName) {
        return this.DB.getUserTables(baseName)
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

    getUsersWithChat(chat_id) {
        return this.DB.getUsersWithChat(chat_id)
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

    getChatStats(chat_id, db) {
        return this.DB.getChatStats(chat_id, db)
            .then(res => {
                if (res.error) return {error : res.error, result: null };
                let arr = [];
                for (let i = 0; i < res.rows.length; i++)
                    arr.push({
                        user: res.rows[i].username,
                        summary: res.rows[i].summary,
                        top_words: JSON.parse(res.rows[i].top_words),
                        top_stickers: JSON.parse(res.rows[i].top_stickers)
                    });
                return arr;
            })
    }

    getChatActivity(chat_id, db, from, to) {
        return this.DB.getChatActivity(chat_id, db, from, to)
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

    getTopWords(n, token, user_id, chat_id){
        return this.authorization(token)
            .then(res => {
                if (!res.result || token === 0) return {error: `cant authorize with ${token}`, result: null};
                let db = res.result[0].database_name;
                return this.DB.getTopWords(parseInt(n), user_id, chat_id, this.dbName(db))
            })
    }

}

module.exports = {
    Bot: Bot
};

