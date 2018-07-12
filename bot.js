class Bot {

    constructor(){
        const Agent = require('socks5-https-client/lib/Agent'),
            TelegramBot = require('./telegram-bot/src/telegram'),
            credentials = require('./telegram.json'),
            certPath = `/etc/letsencrypt/live/egorchepiga.ru/fullchain.pem`,
            privkeyPath = `/etc/letsencrypt/live/egorchepiga.ru/privkey.pem`;

        this.fromTime = '';
        this.toTime = '';
        this.DB = require('./DB');
        this.TOKEN = credentials.telegramCO.botToken;
        this.telegramBot = new TelegramBot(this.TOKEN, {
            webHook: {
                endpoint: '/chat',
                port: 3001,
                key: privkeyPath, // Path to file with PEM private key
                cert: certPath // Path to file with PEM certificate
            },
            request: {
                agentClass: Agent,
                agentOptions: {
                    socksHost: '212.237.21.65',
                    socksPort: 1080,
                    socksUsername: '162182640',
                    socksPassword: 'd37fc81cfd5bb943a323a319d2b61013'
                }
            }
        })
    }

    setWebHook(url) {
        return this.telegramBot.setWebHook(url);
    }

    createChat(msg) {
        return this.DB.query(
            'CREATE TABLE `' + msg.chat.id + '` ' +
            '(id int (10) NOT NULL,' +
            'username varchar(120) NOT NULL,' +
            'summary int (10),' +
            'PRIMARY KEY (username))')
            .then(res => {
                return (res.error) ?
                    {error : res.error, res: null}
                    : this.DB.query(
                        'CREATE TABLE `' + msg.chat.id + '#log` ' +
                        '(id int (10) NOT NULL,' +
                        'username varchar(120) NOT NULL,' +
                        'time DATETIME (6),' +
                        'PRIMARY KEY (id))');
            });
    }

    createUser(msg){
        let table = ' `'+ msg.from.username + '#' + msg.chat.id + '` ';
        return this.DB.query(
            'CREATE TABLE' + table +
            '(word varchar(120) NOT NULL,' +
            'summary int (10) NOT NULL,' +
            'PRIMARY KEY (word))')
            .then(res => {
                return (res.error) ?
                    {error : res.error, res: null}
                    : this.DB.query(
                        'INSERT INTO `' + msg.chat.id + '` ' +
                        '(`id`,`username`,`summary`) ' +
                        'VALUES (?, ?, 0);',
                        [ msg.from.id, msg.from.username + '#' + msg.chat.id]);
            })
    }


    updateUserWords(msg, words) {
        let table = ' `'+ msg.from.username + '#' + msg.chat.id + '` ',
            words_buff = words.slice(0),
            sql = 'INSERT INTO'+ table +'(`word`, `summary`) VALUES ( ? , \'1\')';
        words_buff.push('Messages count');
        for (let i = 0; i < words_buff.length-1; i++)
            sql += ', ( ? , \'1\')';
        sql += ' ON DUPLICATE KEY UPDATE summary=summary+1;';
        return this.DB.query(sql, words_buff)
            .then(res => {
                return (res.error) ?
                    {error : res.error, res: null}
                    : this.DB.query(
                    'INSERT INTO `' + msg.chat.id + '#log` ' +
                    'VALUE (?, ?, NOW() );',
                    [msg.message_id, msg.from.username]);
            }).then(res => {
                return (res.error) ?
                    this.createChat(msg)
                        .then(res => {
                            return this.createUser(msg);
                        }).then(res => {
                        return this.updateUserWords(msg,words)
                    }).then(res => {
                        return (res.error) ?
                            {error : res.error, res: null, info: `Unable to update ${msg.from.username + '#' + msg.chat.id}`}
                            : {error: null, res: true};
                    })
                    : {error: null, res: true};
            });
    }

    watch() {
        this.telegramBot.on('text', msg => {
            if (msg.from.id === msg.chat.id) {
                return {result: null, error: ''};
            }
            let words = msg.text.split(' ');
            this.updateUserWords(msg, words);
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
                    this.updateUserWords(msg, [res.file_path]);
                });
        });

        this.telegramBot.on('photo', msg => {
            if (msg.from.id === msg.chat.id) {
                return {result: null, error: ''};
            }
            this.telegramBot.getFile(msg.photo[3].file_id)
                .then(res => {
                    this.updateUserWords(msg, [res.file_path]);
                });
        });

        this.telegramBot.on('message', msg => {
            console.log(msg);
        })
    }

    //Получаем список чатов, апдейтим, считаем активность, выплёвываем
    //Если вызываем без конкретного chatId, вернётся промис-пустышка, иначе нормальный промис

    analyze(chatId) {
        return (chatId) ?
            this.updateChatStats(chatId)
            : this.getChats().then(res => {
                let chatPromises = [];
                for (let i = 0; i < res.length; i++) {
                    chatPromises.push(this.updateChatStats(res[i]));
                }
                return Promise.all(chatPromises)
            });
    }

    //Гененируем запросы для получения инфы об сообщениях из всех
    //юзерских таблиц. Сливаем всё в таблицу чата.

    updateChatStats(chatId) {
        return this.DB.query('SELECT * FROM  `' + chatId + '`;')
            .then(res => {
                let arrUserTables = [{ username : res.rows[0].username }],
                    chatStats = {};
                let sql = 'SELECT summary ' +
                    'FROM `' + res.rows[0].username + '` ' +
                    'WHERE word = \'Messages count\'';
                if (res.rows.length !== 1) {
                    sql = `(${sql})`;
                    for (let i = 1; i < res.rows.length; i++){
                        arrUserTables.push( { username : res.rows[i].username });
                        sql += ' UNION ' +
                            '(SELECT summary ' +
                            'FROM `' + res.rows[i].username + '` ' +
                            'WHERE word = \'Messages count\')';
                    }
                }
                return (res.error) ?
                    {error : res.error, res: null}
                    : this.DB.query(sql)
                        .then(res => {
                            sql = '';
                            let arrSQLPlaceholder = [];
                            for (let i = 0; i < res.rows.length; i++) {
                                arrUserTables[i].summary = res.rows[i].summary;
                                sql += 'UPDATE `' + chatId + '` ' +
                                    'SET summary = ? ' +
                                    'WHERE username = ? ;';
                                arrSQLPlaceholder.push(arrUserTables[i].summary);
                                arrSQLPlaceholder.push(arrUserTables[i].username);
                            }
                            return (res.error) ?
                                {error : res.error, res: null}
                                : this.DB.transaction(sql, arrSQLPlaceholder);
                        }).then(res => {
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
            });
    }

    getChatStats(chatId) {
        return this.DB.query('SELECT * FROM  `' + chatId + '`;')
            .then(res => {
                let arr = [];
                for (let i = 0; i < res.rows.length; i++) {
                    arr.push({
                        username : res.rows[i].username,
                        summary : res.rows[i].summary,
                        id : res.rows[i].id });
                }
                return (res.error) ? {error : res.error, res: null }
                : arr;
            })
    }

    getChatActivity(chatId, from, to) {
        let sql =
            'SELECT * ' +
            'FROM  `' + chatId + '#log` ';
        sql += (from && to) ? `WHERE time > ${from}  AND time < ${to}` : '';
        return this.DB.query(sql)
            .then(res => {
                let arr = [];
                for (let i = 0; i < res.rows.length; i++) {
                    arr.push({
                        id: res.rows[i].id,
                        username : res.rows[i].username,
                        time: res.rows[i].time })
                }
                return (res.error) ?
                    {error : res.error, res: null }
                    : arr;
            });
    }


    getChats(baseName) {
        baseName = 'stats';                                         //перспектива на масштабирование
        return this.DB.query('SHOW TABLES FROM ' + baseName)
            .then(res => {
                let chats = [];
                for (let i = 0; i < res.rows.length; i++)
                    chats.push(Object.values(res.rows[i])[0]);
                return (res.error) ?
                    {error : res.error, res: null}
                    : chats.filter( tableName => {                       //проверяем, нету ли # в слове. Если нет, то
                        return (tableName.search(/^[^#]*$/) !== -1)       //search возвращает > 0 (т.к. регулярка совпала
                    });
            });
    }
}

module.exports = {
    Bot: Bot
};

process.on('uncaughtException', function(err) {
    console.log(err);
});