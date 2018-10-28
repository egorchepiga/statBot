const DB = require('../../src/DB'),
    assert = require('chai').assert;




describe('Тестирование модуля базы данных', function() {
    let id = 0;
    const USER_ID = 0o0,
        NEW_USER_ID = 1,
        CHAT_ID = 999000,
        CHAT_TITLE = "TEST",
        USER_DB = ' `' + USER_ID + '#telegram`',
        TOKEN = "test",
        TOKEN_ADM = "test",
        WORDS = ["TEST","TEST1","TEST2","TEST3","TEST4"],
        BANNED_WORDS = ["TEST5","TEST6","TEST7","TEST8","TEST9"],
        LOCALE = "ru",
        PRIVACY = true,
        MSG_INIT = {
            message_id : ++id,
            from : {
                id : USER_ID
            },
            chat : {
                title : CHAT_TITLE,
                id : CHAT_ID},
        };
    let MSG = {
        message_id : ++id,
        from : {
            id : NEW_USER_ID
        },
        chat : {
            title : CHAT_TITLE,
            id : CHAT_ID
        },
    };

    this.timeout(20000);


    describe('Регистрация пользователя', () => {

        it('Создание БД пользователя', (done) => {
            DB.createDB(USER_ID)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Создание токена', (done) => {
            DB.createStatToken(USER_ID, TOKEN, TOKEN_ADM)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(error => {
                done(error);
            });
        });

    });

    describe('Создание отчёта', () => {
        it('Авторизация', (done) => {
            DB.authorize(TOKEN)
                .then(res => {
                    assert.equal(res.rows[0].token, TOKEN);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Добавление чата', (done) => {
            DB.createChat(MSG_INIT, USER_DB)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(error => {
                done(error);
            });
        });


    });

    describe('Заполнение отчёта', () => {

        it('Добавление пользователя в отчёт', (done) => {
            DB.createUser(MSG, USER_DB)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Добавление нового сообщения', (done) => {
            MSG.message_id++;
            DB.updateChatWords(MSG, WORDS, USER_DB)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Добавление сообщения только в пользовательскую таблицу', (done) => {
            MSG.message_id++;
            DB.updateChatWordsIfFailed(MSG, WORDS, USER_DB)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(error => {
                done(error);
            });
        });

    });

    describe('Обновление данных', () => {

        it('Локализация', (done) => {
            DB.updateLocale(USER_ID, LOCALE)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Забаненные слова', (done) => {
            DB.updateBannedWords(USER_ID, CHAT_ID, BANNED_WORDS)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Настройки приватности', (done) => {
            DB.setChatPrivacy(CHAT_ID, PRIVACY)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Пользовательская информация', (done) => {
            DB.updateUserInfo(CHAT_ID, USER_ID, "TEST", "TEST", USER_DB)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Отчёта', (done) => {
            DB.updateChatStats(CHAT_ID, USER_DB)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(error => {
                done(error);
            });
        });

    });


    describe('Верификация данных', () => {

        it('Информация о БД', (done) => {
            DB.getDBInfoByUserId(USER_ID)
                .then(res => {
                    assert.equal(res.rows[0].database_name, USER_ID);
                    assert.equal(res.rows[0].token, TOKEN);
                    assert.equal(res.rows[0].admin_token, TOKEN_ADM);
                    assert.equal(res.rows[0].locale, LOCALE);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Информация о чате', (done) => {
            DB.getUserWithChat(CHAT_ID)
                .then(res => {
                    assert.equal(res.rows[0].database_name, USER_ID);
                    assert.equal(res.rows[0].chat_name, MSG.chat.title);
                    assert.deepEqual(JSON.parse(res.rows[0].banned_words), BANNED_WORDS);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Информация об активности чата', (done) => {
            DB.getChatActivity(CHAT_ID, USER_DB)
                .then(res => {
                    assert.isAbove(res.length, 0);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Информация о БД содержащей чат', (done) => {
            DB.getDBInfo(CHAT_ID)
                .then(res => {
                    assert.equal(res.rows[0].database_name, USER_ID);
                    assert.equal(res.rows[0].token, TOKEN);
                    assert.equal(res.rows[0].admin_token, TOKEN_ADM);
                    assert.equal(res.rows[0].locale, LOCALE);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Статистика чата', (done) => {

            const expected = [
                {
                    user: '1',
                    summary: 2,
                    top_words: {
                        TEST : 2,
                        TEST1 : 2,
                        TEST2 : 2,
                        TEST3 : 2,
                        TEST4 : 2
                    },
                    top_stickers: {},
                    img: null,
                    id: '1' },
                {
                    user: 'TEST',
                    summary: 2,
                    top_words: {
                        TEST : 1,
                        TEST1 : 1,
                        TEST2 : 1,
                        TEST3 : 1,
                        TEST4 : 1
                    },
                    top_stickers: {},
                    img: null,
                    id: '999000' }
            ];

            DB.getChatStats(CHAT_ID, USER_DB)
                .then(res => {
                    assert.deepEqual(res, expected);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Забаненные слова', (done) => {

            const expected =
                {
                    database_name: '0',
                    chat_name: 'TEST',
                    banned_words: '["TEST5","TEST6","TEST7","TEST8","TEST9"]'
                };

            DB.getBannedWords(CHAT_ID, USER_ID.toString())
                .then(res => {
                    assert.deepEqual(res, expected);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Топ слов пользователя', (done) => {
            const expected =
                {
                    TEST: 2,
                    TEST1: 2,
                    TEST2: 2,
                    TEST3: 2,
                    TEST4: 2
                };

            DB.getTopWords(10, NEW_USER_ID, CHAT_ID, USER_DB)
                .then(res => {
                    assert.deepEqual(res, expected);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Приватность', (done) => {
            DB.isChatPrivate(CHAT_ID)
                .then(res => {
                    assert.equal(res, true);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('id всех чатов пользователя', (done) => {
            DB.getUserTables(USER_DB)
                .then(res => {
                    assert.deepEqual(res, ['999000']);
                    done()
                }).catch(error => {
                done(error);
            });
        });

        it('Имена чатов', (done) => {
            DB.getChatsNames([CHAT_ID])
                .then(res => {
                    assert.deepEqual(res, { '999000': 'TEST' });
                    done()
                }).catch(error => {
                done(error);
            });
        });

    });

    describe('Очистка', () => {
        it('Удаление чата', (done) => {
            DB.clearChat(CHAT_ID)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(error => {
                done(error);
            });
        });


        it('Очистка БД пользователя и записи в ROOMS', (done) => {
            DB.clearBase(USER_ID)
                .then(res => {
                    assert.equal(res.error, null);
                    done()
                }).catch(error => {
                done(error);
            });
        });
    });

});

