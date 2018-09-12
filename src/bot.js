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

    getFilePath(file_id) {
        return this.telegramBot.getFile(file_id)
            .then(res => {
               return res.file_path;
            });
    }

    requestUserImages(chat){
        let promiseArr = [];
        for(let i = 0; i < chat.users.length; i++)
            if (chat.users[i].img) promiseArr.push(this.getFilePath(chat.users[i].img));
        return Promise.all(promiseArr)
            .then(res=> {
                let resIndex = 0;
                for(let i = 0; i < chat.users.length; i++)
                    if (chat.users[i].img) chat.users[i].img = res[resIndex++];
                return chat;
            });
    }

    requestStickers(chat){
        let topStickers = {};
        let chatTopStickers = {};
        let promiseArr = [];
        for(let i = 0; i < chat.users.length; i++) {
            for(let key in chat.users[i].top_stickers) {
                promiseArr.push(this.getFilePath(key.slice(9)))                                                         //remove stickers/ from top_stickers DB
            }
        }
        for(let key in chat.chat.top_stickers) {
            promiseArr.push(this.getFilePath(key.slice(9)))
        }
        return Promise.all(promiseArr)
            .then(res=> {
                let resIndex = 0;
                for(let i = 0; i < chat.users.length; i++) {
                    for(let key in chat.users[i].top_stickers) {
                        topStickers[res[resIndex++]] = chat.users[i].top_stickers[key];
                    }
                    chat.users[i].top_stickers = topStickers;
                    topStickers = {};
                }

                for(let key in chat.chat.top_stickers) {
                    chatTopStickers[res[resIndex++]] = chat.chat.top_stickers[key];
                }
                chat.chat.top_stickers = chatTopStickers;
                return chat;
            }).catch(error => {
                return {error : error, result: null};
            });
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
                if (res.error) return {error: res.error, result: null};
                chatStats.chat = res[0];
                res.splice(0, 1);
                chatStats.users = res;
               /* return this.telegramBot.getFile(chatStats.chat.img)
            }).then(res => {
                chatStats.chat.img = res.file_path;*/
                return this.getChatActivity(chat_id, db, this.fromTime, this.toTime)
            }).then(res => {
                if (res.error) return {error : res.error, result: null};
                chatStats.time = res;
                /*return this.requestStickers(chatStats);
            }).then(res => {
                if (res.error) {
                    console.log(res);
                    return chatStats;
                }
                chatStats = res;
                return this.requestUserImages(chatStats);
            }).then(res => {
                if (res.error) {
                    console.log(res);
                    return chatStats;
                }
                chatStats = res;*/
                return chatStats;
            });
    }

    refreshUsersInfo(chat_id, db) {
        return this.getChatStats(chat_id, db)
            .then(res => {
                return this.updateUsersInfo(res, chat_id, db)
            })
    }

    renewBase(base) {
        return this.DB.clearBase(base)
            .then(res => {
                if (res.error) return {error: res.error, result: null};
                return this.createStatToken(base)
            }).then(res => {
                if (res.error) return {error: res.error, result: null};
                return res
            });
    }

    createChat(msg) {
        let db = this.dbName(msg.from.id);
        return this.DB.createChat(msg, db );
    }

    createUser(msg, db) {
        return this.DB.createUser(msg, db)
            .then(res => {
                if (res.error) return {error: res.error, result: null};
                return this.telegramBot.getUserProfilePhotos(msg.from.id)
            }).then(res => {
                return this.DB.updateUserInfo(msg.chat.id, msg.from.id, res.photos[0][0].file_id, msg.from.username, true, db)
            });
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
                if (res.error) return {error : res.error, result: null};
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

    updateUsersInfo(users, chat_id, db) {
        let promises = [];
        promises.push(
            this.telegramBot.getChat(chat_id)
                .then(res => {
                    return this.DB.updateUserInfo(chat_id, chat_id, res.photo.small_file_id, res.title, users[0].username === res.title, db)    //!!!!!
                })
        );
        users.splice(1,0);
        users.map((item) => {
            let member;
            promises.push(
                this.telegramBot.getChatMember(chat_id, item.id)
                    .then( res => {
                        member = res;
                        return this.telegramBot.getUserProfilePhotos(item.id)
                    }).then(res => {
                        return this.DB.updateUserInfo(chat_id, item.id, res.photos[0][0].file_id, member.user.username ? member.user.username : member.user.id, member.user.username === item.user, db)
                    }).catch(err => {
                        //console.log(item.id + item.chosen + ' without profile_image');                                  //logging
                        return {error: err, res: null}
                    })
            );
        });
        return Promise.all(promises);
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
    }

    getUsersWithChat(chat_id) {
        return this.DB.getUsersWithChat(chat_id)
    }

    getChatStats(chat_id, db) {
        return this.DB.getChatStats(chat_id, db)
    }

    getChatActivity(chat_id, db, from, to) {
        return this.DB.getChatActivity(chat_id, db, from, to)
    }

    getTopWords(n, token, user_id, chat_id){
        return this.authorization(token)
            .then(res => {
                if (!res.result || token === 0) return {error: `cant authorize with ${token}`, result: null};
                let db = res.result[0].database_name;
                return this.DB.getTopWords(parseInt(n), user_id, chat_id, this.dbName(db))
            })
    }

    watch() {
        let self = this;

        this.telegramBot.on('callback_query', function (msg) {
            if (msg.data === 'отчёт')
                self.createStatToken(msg.from.id)
                    .then(res => {
                        if (res.error) console.log(res.error);
                        let link = 'https://egorchepiga.ru/' + res;
                        this.answerCallbackQuery(msg.id, link, true);
                        this.sendMessage( msg.message.chat.id, link);
                    });
            else if (msg.data === 'обнулить') {
                self.renewBase(msg.from.id)
                    .then(res => {
                        if (res.error) return({error : res.error, result: null});
                        let link = 'https://egorchepiga.ru/' + res;
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
                                        if ((data.status === "creator") || (data.status === "administrator"))
                                            return self.DB.findChat(msg.chat.id).then(
                                                res => {
                                                    if (res.rows.length > 0)
                                                        return self.telegramBot.sendMessage( msg.chat.id, "https://egorchepiga.ru/" + res.rows[0].token);
                                                }
                                            );
                                        else return self.telegramBot.sendMessage( msg.chat.id, "This chat is private. Only administration has access, sorry ;(");
                                    });
                            }
                            else return self.DB.findChat(msg.chat.id).then(
                                res => {
                                    if (res.rows.length > 0)
                                        return self.telegramBot.sendMessage( msg.chat.id, "https://egorchepiga.ru/" + res.rows[0].token);
                                }
                            );
                        });
                } else if (msg.text.indexOf('/privacy@egorchepiga_bot') !== -1) {
                    this.telegramBot.getChatMember(msg.chat.id, msg.from.id)
                        .then(function(data) {
                            if ((data.status === "creator") || (data.status === "administrator")){
                                self.DB.isChatPrivate(msg.chat.id)
                                    .then(res => {
                                        let str = (res) ? 'Защита деактивирована.':'Защита активирована.' ;
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

        this.telegramBot.on('sticker', msg => {
            if (msg.from.id === msg.chat.id) {
                return {result: null, error: 'PRIVATE_MSG_NOT_ALLOWED'};
            }
            this.updateUsersWords(msg, ['stickers/' + msg.sticker.file_id]);
        });

    }

    stopWatch() {
        this.telegramBot.on('text', msg => {});
        this.telegramBot.on('sticker', msg => {});
        this.telegramBot.on('photo', msg => {});
        this.telegramBot.on('message', msg => {});
    }

}

module.exports = {
    Bot: Bot
};

