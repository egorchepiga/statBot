class Bot {

    constructor(TOKEN, OPTIONS) {
        this.LOCALE = require('./locale');
        const TelegramBot = require('../telegram-bot/src/telegram');
        this.SHA512 = require('js-sha512');
        this.DB = require('./DB');
        this.fromTime = '';
        this.toTime = '';
        this.SECRET = OPTIONS.secret;
        this.TOKEN = TOKEN;
        this.BOT_NAME = OPTIONS.botName;
        this.BOT_NICKNAME = OPTIONS.botNick;
        this.telegramBot = new TelegramBot(this.TOKEN, OPTIONS);
        this.topSize = parseInt(OPTIONS.topSize) || 5;
    }

    repairBase(){

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
                return this.getChatActivity(chat_id, db, this.fromTime, this.toTime)
            }).then(res => {
                if (res.error) return {error : res.error, result: null};
                chatStats.time = res;
                return chatStats;
            });
    }

    refreshUsersInfo(token, admin_token, chat_id) {
        return this.authorization(token)
            .then(res => {
                if (!res.result || res.result[0].admin_token !== admin_token || token === 0) return {error: `cant authorize with ${token}`, result: null};
                let db = this.dbName(res.result[0].database_name);
                return this.getChatStats(chat_id, db)
                    .then(res => {
                        return this.updateUsersInfo(res, chat_id, db)
                    })
            });
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
        return this.DB.createChat(msg, db )
            .then( res => {
                return this.getChatStats(msg.chat.id, db)
            }).then(res => {
                return this.updateUsersInfo(res, msg.chat.id, db)
            });
    }

    createUser(msg, db) {
        return this.DB.createUser(msg, db)
            .then(res => {
                if (res.error) return {error: res.error, result: null};
                return this.telegramBot.getUserProfilePhotos(msg.from.id)
            }).then(res => {
                let photo = "";
                if (res.photos && res.photos[0] && res.photos[0][0]) photo = res.photos[0][0].file_id;
                return this.DB.updateUserInfo(msg.chat.id, msg.from.id, photo, msg.from.username, db)
            });
    }

    createStatToken (user_id) {
        let token = this.SHA512(new Date() + this.SHA512(user_id.toString()) + this.SECRET).substring(17, 37),
            adminToken = this.SHA512(this.SHA512(user_id.toString()) + this.SECRET + new Date()).substring(17, 37);
        return this.DB.createStatToken(user_id, token, adminToken)
            .then(res => {
                if (res.error) return {error : res.error, result: null}
                return {token: token, admin_token: adminToken };
            });
    }

    destroyChat (chat_id) {
        return this.DB.clearChat(chat_id)
            .then(res => {
                if (res.error) return {error: error, result: false};
                this.telegramBot.leaveChat(chat_id);
                return {error: null, result: true}
            });
    }

    destroyChatManually(token, admin_token, chat_id) {
        return this.authorization(token)
            .then(res => {
                    if (!res.result || res.result[0].admin_token !== admin_token || token === 0)
                        return { error: `cant authorize with ${token}`, result: null };
                    return this.destroyChat(chat_id);
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
                                        return this.updateChatWordsIfFailed(msg, words, db)
                                    })
                            })
                    );
                }
                return Promise.all(chatPromises)
            });
    }

    updateChatWordsIfFailed(msg, words, db) {
        return this.DB.updateChatWordsIfFailed(msg, words, db);
    }

    updateChatWords(msg, words, db) {
        return this.DB.updateChatWords(msg, words, db);
    }

    updateChatStats(chat_id, db) {
        return this.DB.updateChatStats(chat_id, db)
    }

    updateBannedWords(token, admin_token, chat_id, bannedWords){
        return this.authorization(token)
            .then(res => {
                if (!res.result || res.result[0].admin_token !== admin_token || token === 0) return {error: `cant authorize with ${token}`, result: null};
                let user_id = res.result[0].database_name;
                return this.DB.updateBannedWords(user_id, chat_id, bannedWords)
            });
    }

    updateUsersInfo(users, chat_id, db) {
        let promises = [];
        promises.push(
            this.telegramBot.getChat(chat_id)
                .then(res => {
                    let photo = "";
                    if (res.photo) photo = res.photo.small_file_id;
                    return this.DB.updateUserInfo(chat_id, chat_id, photo, res.title, db)    //!!!!!
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
                }).catch(err => {                     //logging
                    return {error: err, res: null}
                })
            );
        });
        return Promise.all(promises);
    }

    getBannedWords(chat_id, user_id){                                                                   //also returns chat_name
        return this.DB.getBannedWords(chat_id, user_id)
    }

    getChats(token, admin_token){
        return this.authorization(token)
            .then(res => {
                if (!res.result || res.result[0].admin_token !== admin_token || token === 0)
                    return {error: `cant authorize with ${token}`, result: null};
                let user_id = res.result[0].database_name;
                return this.getUserChats(this.dbName(user_id))
            }).then(res => {
                if (res.error) return res;
                return this.DB.getChatsNames(res)
            });
    }

    getUserChats(baseName) {
        return this.DB.getUserTables(baseName)
    }

    getUsersWithChat(chat_id) {
        return this.DB.getUserWithChat(chat_id)
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
            if (msg.data === 'ru' || msg.data === 'en'){
                self.DB.updateLocale(msg.from.id, msg.data);
                self.createStatToken(msg.from.id)
                    .then(res => {
                        if (res.error) console.log(res.error);
                        let link = self.LOCALE[msg.data].link+'\n' + 'https://egorchepiga.ru/stats/?token=' + res.token + '&adm=' + res.admin_token;
                        let options = {
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [{ text: self.LOCALE[msg.data].buttons.invite,  url: `https://telegram.me/${self.BOT_NAME}?startgroup=true` ,callback_data: 'invite'}],
                                    [
                                        {text: self.LOCALE[msg.data].buttons.recreate, callback_data: 'отчёт'},
                                        {text: self.LOCALE[msg.data].buttons.delete, callback_data: 'обнулить'}
                                    ]
                                ]
                            })
                        };
                        this.answerCallbackQuery(msg.id, "", true);
                        self.telegramBot.sendMessage( msg.from.id, self.LOCALE[msg.data].about, options)
                            .then(res => {
                                self.telegramBot.sendMessage( msg.from.id,link);
                            });
                    });
            }
            if (msg.data === 'отчёт')
                self.createStatToken(msg.from.id)
                    .then(res => {
                        if (res.error) console.log(res.error);
                        self.DB.getDBInfoByUserId(msg.from.id)
                            .then(localeRes=> {
                                let locale = localeRes.rows[0].locale;
                                let link = self.LOCALE[locale].link+'\n' + 'https://egorchepiga.ru/stats/?token=' + res.token + '&adm=' + res.admin_token;
                                this.answerCallbackQuery(msg.id, "", true);
                                this.sendMessage( msg.message.chat.id, link);
                            })
                    });
            else if (msg.data === 'обнулить') {
                self.getUserChats(self.dbName(msg.from.id))
                    .then(res => {
                        let arrPromises =[];
                        for(let i=0; i < res.length; i++)
                            arrPromises.push(self.telegramBot.leaveChat(res[i]))
                        return arrPromises;
                    }).then(res => {
                    return self.renewBase(msg.from.id)
                }).then(res => {
                    if (res.error) return({error : res.error, result: null});
                    self.DB.getDBInfo(msg.from.id)
                        .then(localeRes=> {
                            let locale = localeRes.rows[0].locale;
                            this.answerCallbackQuery(msg.id, 'success', false);
                            this.sendMessage(  msg.message.chat.id, self.LOCALE[locale].deleted)
                        })
                })
            }
        });

        this.telegramBot.on('text', msg => {
            if (msg.from.id === msg.chat.id) {
                if(msg.text === '/start') {
                    this.DB.createDB(msg.from.id)
                        .then(res => {
                            return this.createStatToken(msg.from.id)
                        }).then(res => {
                        if (res.error) console.log({error: res.error, result: null});
                        let options = {
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [
                                        {text: 'English', callback_data: 'en'},
                                        {text: 'Русский', callback_data: 'ru'}
                                    ]
                                ]
                            })
                        };
                        this.telegramBot.sendMessage( msg.chat.id,'Choose your language. \nВыберите язык.', options)
                    });
                }
                else if (msg.text.indexOf('/help') !== -1) {
                    self.DB.getDBInfoByUserId(msg.from.id)
                        .then(localeRes=> {
                            let locale = localeRes.rows[0].locale;
                            this.telegramBot.sendMessage( msg.chat.id,self.LOCALE[locale].help);
                        })
                }
                else if (msg.text.indexOf('/privacy') !== -1) {
                    self.DB.getDBInfoByUserId(msg.from.id)
                        .then(localeRes=> {
                            let locale = localeRes.rows[0].locale;
                            this.telegramBot.sendMessage(msg.chat.id, self.LOCALE[locale].privacy.info)
                        });
                }
            } else if(msg.entities) {
                if (msg.text.indexOf('/report@'+ this.BOT_NAME) !== -1) {
                    let chat = msg.chat.id;
                    let privacy;
                    this.DB.isChatPrivate(msg.chat.id)
                        .then(res => {
                            privacy = res;
                            return self.DB.getDBInfo(msg.chat.id);
                        }).then(localeRes=> {
                            let locale = localeRes.rows[0].locale;
                            if (privacy) {
                                let chatMember;
                                return this.telegramBot.getChatMember(msg.chat.id, msg.from.id)
                                    .then(data => {
                                        chatMember = data;
                                        if ((chatMember.status === "creator") || (chatMember.status === "administrator"))
                                            return self.DB.getDBInfo(msg.chat.id).then(
                                                res => {
                                                    if (res.rows.length > 0)
                                                        return self.telegramBot.sendMessage( msg.chat.id,
                                                            "https://egorchepiga.ru/stats/?token=" + res.rows[0].token + '&chat=' + msg.chat.id + '&l=' + locale);
                                                }
                                            );
                                        else return self.telegramBot.sendMessage( msg.chat.id, self.LOCALE[locale].privacy.msg);
                                    });
                            }
                        else {
                            return self.DB.getDBInfo(msg.chat.id).then(
                                res => {
                                    if (res.rows.length > 0)
                                        return self.telegramBot.sendMessage(msg.chat.id,
                                            "https://egorchepiga.ru/stats/?token=" + res.rows[0].token + '&chat=' + msg.chat.id + '&l=' + locale);
                                }
                            );
                        }
                        });
                } else if (msg.text.indexOf('/private@' + this.BOT_NAME) !== -1) {
                    let chatMember;
                    this.telegramBot.getChatMember(msg.chat.id, msg.from.id)
                        .then(function(data) {
                            chatMember = data;
                            return self.DB.getDBInfo(msg.chat.id);
                        }).then(localeRes=> {
                            if (!localeRes.rows) console.log(msg.chat.id, localeRes);
                            let locale = localeRes.rows[0].locale;
                            if ((chatMember.status === "creator") || (chatMember.status === "administrator")){
                                self.DB.isChatPrivate(msg.chat.id)
                                    .then(res => {
                                        let str = (res) ? self.LOCALE[locale].privacy.mode.disabled : self.LOCALE[locale].privacy.mode.enabled ;
                                        self.DB.setChatPrivacy(msg.chat.id, !res);
                                        self.telegramBot.sendMessage( msg.chat.id, str);
                                    });
                            } else self.telegramBot.sendMessage( msg.chat.id, self.LOCALE[locale].privacy.settings);
                        });
                }
                else if (msg.text.indexOf('/destroy@'+ this.BOT_NAME) !== -1) {
                    let chatMember;
                    this.telegramBot.getChatMember(msg.chat.id, msg.from.id)
                        .then(function(data) {
                            chatMember = data;
                            return self.DB.getDBInfo(msg.chat.id);
                        }).then(localeRes=> {
                        let locale = localeRes.rows[0].locale;
                        if ((chatMember.status === "creator") || (chatMember.status === "administrator")){
                            self.telegramBot.sendMessage( msg.chat.id, self.LOCALE[locale].destroy.success)
                                .then(res =>
                                    this.destroyChat(msg.chat.id)
                                );
                        } else self.telegramBot.sendMessage( msg.chat.id, self.LOCALE[locale].destroy.fail);
                    });
                }
            }
            else {
                let words = msg.text.split(/[^a-zA-Zа-яА-Яё]/)
                    .filter(word => {
                        return (word !== '' && word.length > 1)
                    }).map(word => {
                        return word.toLowerCase();
                    });
                this.updateUsersWords(msg, words)
            }
        });

        //Ивент, при добавлении бота в группу
        this.telegramBot.on('message', msg => {
            if( msg.new_chat_participant &&  msg.new_chat_participant.username === this.BOT_NAME || msg.group_chat_created === true)  {
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

