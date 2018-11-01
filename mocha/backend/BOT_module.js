const assert = require('chai').assert,
    BOT = require('../../src/bot').Bot,
    AGENT = require('socks5-https-client/lib/Agent'),
    CONFIG = require('../../../tconfig'),
    OPTIONS = {
        request: {
            agentClass: AGENT,
            agentOptions: {
                socksHost: CONFIG.SOCKS5.socksHost,
                socksPort: CONFIG.SOCKS5.socksPort,
                socksUsername: CONFIG.SOCKS5.socksUsername,
                socksPassword: CONFIG.SOCKS5.socksPassword
            }
        },
        botName: CONFIG.bot.NAME,
        botNick: CONFIG.bot.NICKNAME,
        secret : CONFIG.secret,
        mainBase: CONFIG.bot.mainBase,
        topSize : CONFIG.bot.topSize,
        bannedWords : CONFIG.bot.bannedWords
    },
    USER_ID = "162182640",
    CHAT_ID = "-319895645",
    CHAT_TITLE = "WRONG TITLE TEST",
    USER_DB = ' `' + USER_ID + '#telegram`',
    WORDS = ["TEST","TEST1","TEST2","TEST3","TEST4"],
    BANNED_WORDS = ["TEST5","TEST6","TEST7","TEST8","TEST9"],
    MSG_INIT = {
        message_id : 0,
        from : {
            username : "TEST1",
            id : USER_ID
        },
        chat : {
            title : CHAT_TITLE,
            id : CHAT_ID
        },
    };
let bot = new BOT(CONFIG.bot.TOKEN,OPTIONS);

describe('Тестирование модуля Бота', function() {

    let token, admin_token;
    this.timeout(10000);

    describe('Регистрация', function() {

        it('Генерации имени базы данных', () => {
            let db = bot.dbName(USER_ID);
            assert.equal(db, USER_DB);
        });

        it('Создание токена', (done) => {
            bot.createStatToken(MSG_INIT.from.id)
                .then(res => {
                    assert.equal(res.error, null);
                    admin_token = res.admin_token;
                    token = res.token;
                    done()
                }).catch(err => {
                    done(err)
            })
        });

        it('Авторизация', (done) => {
            bot.authorization(token)
                .then(res => {
                    assert.equal(res.result[0].admin_token, admin_token);
                    done();
                }).catch(err => {
                    done(err)
                })
        });

        it('Регистрация чата', (done) => {              //бот должен быть в группе
            bot.createChat(MSG_INIT)
                .then(res => {
                    for (let v in res) {
                        assert.equal(res[v].error, null);
                    }
                    assert.equal(res.error, null);
                    done()
                }).catch(err => {
                    done(err)
                })
        });

    });

    describe('Заполнение отчёта', function() {

        it('Добавление чата как пользователя', (done) => {
            bot.createUser({from: {id: CHAT_ID, username: CHAT_TITLE},chat: {id: CHAT_ID}}, USER_DB)
                .then(res => {
                    assert.equal(res.error, null)
                    done()
                }).catch(e => {
                done(e)
            })
        });

        it('Добавление пользователя', (done) => {
            bot.createUser(MSG_INIT, USER_DB)
                .then(res => {
                    assert.equal(res.error, null)
                    done()
                }).catch(e => {
                    done(e)
            })
        });

        it('Добавление сообщения', (done) => {
            bot.updateChatWords(MSG_INIT, WORDS, USER_DB)
                .then(res => {
                    for (let v in res.rows) {
                        assert.equal(res.rows[v].error, null);
                    }
                    done()
                }).catch(e => {
                done(e)
            })
        });

        it('Добавление сообщения только в пользовательскую таблицу', (done) => {
            bot.updateChatWordsIfFailed(MSG_INIT, WORDS, USER_DB)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(e => {
                done(e)
            })
        });

    });

    describe('Обновление отчёта', function() {

        it('Обновление слов пользователей', (done) => {
            bot.refreshInfo(CHAT_ID, USER_ID)
                .then(res => {
                    for (let v in res.rows) {
                        assert.equal(res.rows[v].error, null);
                    }
                    done()
                }).catch(e => {
                done(e)
            })
        });

        it('Обновление пользовательской информации с авторизацией', (done) => {
            bot.refreshUsersInfo(token, admin_token, CHAT_ID)
                .then(res => {
                    for (let v in res.rows) {
                        assert.equal(res.rows[v].error, null);
                    }
                    done()
                }).catch(e => {
                done(e)
            })
        });

        it('Обновление пользовательской информации', (done) => {
            bot.updateUsersInfo([MSG_INIT.from], CHAT_ID, USER_DB)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(e => {
                done(e)
            })
        });

        it('Обновление слов пользователей', (done) => {
            bot.updateUsersWords(MSG_INIT, WORDS)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(e => {
                done(e)
            })
        });

        it('Обновление забаненных слов', (done) => {
            bot.updateBannedWords(token, admin_token, CHAT_ID, BANNED_WORDS)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(e => {
                done(e)
            })
        });

        it('Обновление пользовательских данных', (done) => {
            bot.updateUsersInfo([MSG_INIT.from], CHAT_ID, USER_DB)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(e => {
                done(e)
            })
        });

        it('Обновление отчёта', (done) => {
            bot.updateChatStats(CHAT_ID, USER_DB)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(e => {
                done(e)
            })
        });
    });

    describe('Верификация данных', function() {

        it('Список чатов пользователя', (done) => {
            bot.getUserChats(USER_DB)
                .then(res => {
                    let expected = [ '-1001331385107', '-319895645' ];
                    assert.deepEqual(res, expected);
                    done();
                }).catch(e => {
                done(e);
            })
        });

        it('Список чатов пользователя с названиями', (done) => {
            bot.getChats(token, admin_token)
                .then(res => {
                    let expected = { '-1001331385107': 'dev Ops', '-319895645': 'Тест Test' };
                    assert.deepEqual(res, expected);
                    done();
                }).catch(e => {
                done(e);
            })
        });

        it('Информация о чате', (done) => {
            bot.getUsersWithChat(CHAT_ID)
                .then(res => {
                    let expected = {
                        database_name: '162182640',
                        chat_name: 'Тест Test',
                        banned_words: '["TEST5","TEST6","TEST7","TEST8","TEST9"]' };
            assert.deepEqual(res.rows[0], expected);
                    done();
                }).catch(e => {
                done(e);
            })
        });

        it('Активность чата', (done) => {
            bot.getChatActivity(CHAT_ID, USER_DB)
                .then(res => {
                    assert.equal(res[0].user_id, USER_ID);
                    done();
                }).catch(e => {
                done(e);
            })
        });

        it('Забаненные слова', (done) => {
            let expected = {
                database_name: '162182640',
                chat_name: 'Тест Test',
                banned_words: '["TEST5","TEST6","TEST7","TEST8","TEST9"]' };
            bot.getBannedWords(CHAT_ID, USER_ID)
                .then(res => {
                    assert.deepEqual(res, expected);
                    done();
                }).catch(e => {
                done(e);
            })
        });

        it('Топ слов', (done) => {
            let expected = { TEST: 4, TEST1: 4, TEST2: 4, TEST3: 4, TEST4: 4 };
            bot.getTopWords(5, token, USER_ID, CHAT_ID)
                .then(res => {
                    assert.deepEqual(res, expected);
                    done();
                }).catch(e => {
                done(e);
            })
        });

        it('Запрос файла у telegram', (done) => {
            let fileId = "AgADAgADtKcxG_C1qgmYdiKGdtH8U1zNtw4ABIJTko5zL88O7JEAAgI";
            bot.getFilePath(fileId)
                .then(res => {
                    assert.equal(res.error, null);
                    done();
                }).catch(e => {
                done(e);
            })
        });

        it('Данные для отчёта без временных логов', (done) => {
            bot.getChatStats(CHAT_ID, USER_DB)
                .then(res => {
                    let wordsExpected = { TEST: 2, TEST1: 2, TEST2: 2, TEST3: 2, TEST4: 2 };
                    let userWordsExpected = { TEST: 4, TEST1: 4, TEST2: 4, TEST3: 4, TEST4: 4 };
                    assert.deepEqual(res[0].top_words, wordsExpected);
                    assert.deepEqual(res[1].top_words, userWordsExpected);
                    done();
                }).catch(e => {
                done(e);
            })
        });

        it('Весь отчёт', (done) => {
            bot.loadChat(token, CHAT_ID)
                .then(res => {
                    assert.equal(res.id, CHAT_ID);
                    assert.equal(res.users[0].id, USER_ID);
                    done();
                }).catch(e => {
                    done(e);
            })
        });

    });

    describe('Очистка', function() {

        it('Удаление отчёта', (done) => {
            bot.destroyChatManually(token, admin_token, CHAT_ID)
                .then(res => {
                    assert.equal(res.error, null);
                    done();
                }).catch(e => {
                done(e);
            })
        });
    });

});
