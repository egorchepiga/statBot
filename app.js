let express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    https = require('https'),
    getSocks = require('socks5-https-client'),
    fs = require('fs');
const BOT = require('./src/bot').Bot,
    AGENT = require('socks5-https-client/lib/Agent'),
    CONFIG = require('./config'),
    TOKEN = CONFIG.bot.TOKEN,
    OPTIONS = {
        webHook: {
            endpoint: '/tg-hook/',
            port: CONFIG.bot.port,
            key: CONFIG.bot.privkey, // Path to file with PEM private key
            cert: CONFIG.bot.cert, // Path to file with PEM certificate
        },
        request: {
            agentClass: AGENT,
            agentOptions: {
                socksHost: CONFIG.SOCKS5.socksHost,
                socksPort: CONFIG.SOCKS5.socksPort,
                socksUsername: CONFIG.SOCKS5.socksUsername,
                socksPassword: CONFIG.SOCKS5.socksPassword
            }
        },
        secret : CONFIG.secret,
        mainBase: CONFIG.bot.mainBase,
        topSize : CONFIG.bot.topSize,
        bannedWords : CONFIG.bot.bannedWords
    },
    KEY = fs.readFileSync(CONFIG.bot.privkey),
    CERT = fs.readFileSync(CONFIG.bot.cert),
    SSL_CREDENTIALS = {key: KEY, cert: CERT},
    SSL_PORT = 3000,
    GET_SOCKS_OPTIONS = {
        ...OPTIONS.request.agentOptions,
        ...SSL_CREDENTIALS,
        hostname : 'api.telegram.org',
        rejectUnauthorized : true
    };

let bot = new BOT(TOKEN,OPTIONS);
bot.setWebHook('https://egorchepiga.ru/tg-hook/');
bot.watch();

let httpsServer = https.createServer(SSL_CREDENTIALS, app);
httpsServer.listen(SSL_PORT, () => {
    console.log(`https server is listening on ${SSL_PORT}`);
});

app.use(bodyParser.json());

app.get(`/chats/`, (req, res) => {
    let token = req.param('token') ,
        admin_token = req.param('adm');
    console.log(admin_token);
    console.log(token);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    bot.getChats(token,admin_token)
        .then(botRes => {
            if (res.error) {
                console.log(botRes);
                res.sendStatus(401);
            } else {
                res.send(JSON.stringify(botRes));
            }
        })
});

app.get(`/load/`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    let token = req.param('token'),
        chat_id = req.param('chat_id');
        bot.loadChat(token, chat_id)
        .then(botRes => {
            if (botRes.error) {
                console.log(botRes);
                res.sendStatus(401);
            } else {
                res.send(JSON.stringify(botRes));
            }
        });
});

app.get(`/banned/`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    let token = req.param('token'),
        chat_id = req.param('chat_id'),
        bannedWords = req.param('banned_words');
    bot.updateBannedWords(token, chat_id, bannedWords)
        .then(botRes => {
            if (botRes.error) {
                console.log(botRes);
                res.sendStatus(401);
            } else {
                res.send(JSON.stringify(botRes));
            }
        });
});


app.get(`/more/`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    let token = req.param('token'),
        chat_id = req.param('chat_id'),
        n = req.param('count'),
        user_id = req.param('user_id');
    bot.getTopWords(n, token, user_id, chat_id)
        .then(botRes => {
            if (botRes.error) {
                console.log(botRes);
                res.sendStatus(401);
            } else {
                res.send(JSON.stringify(botRes));
            }
        });
});

app.get('/stickers/*', (req, res) => {
    let path = req.route.path;
    path = path.slice(0, path.length-1);
    getSocks.get({
        ...GET_SOCKS_OPTIONS,
        path: '/file/bot'+ TOKEN + path + req.params[0]
    }, function (socksRes) {
        socksRes.on('readable', function () {
            let chunk = socksRes.read();
            if (chunk) {
                let buffer = Buffer.alloc(chunk.length, chunk);
                res.write(buffer);
            }
        });
        socksRes.on('end', function () {
            res.end();
        });
    });
});

app.get('/profile_photos/*', (req, res) => {
    let path = req.route.path;
    path = path.slice(0, path.length-1);
    getSocks.get({
        ...GET_SOCKS_OPTIONS,
        path: '/file/bot'+ TOKEN + path + req.params[0]
    }, function (socksRes) {
        socksRes.on('readable', function () {
            let chunk = socksRes.read();
            if (chunk) {
                let buffer = Buffer.alloc(chunk.length, chunk);
                res.write(buffer);
            }
        });
        socksRes.on('end', function () {
            res.end();
        });
    });
});

app.get('/photos/*', (req, res) => {
    let path = req.route.path;
    path = path.slice(0, path.length-1);
    getSocks.get({
        ...GET_SOCKS_OPTIONS,
        path: '/file/bot'+ TOKEN + path + req.params[0]
    }, function (socksRes) {
        socksRes.on('readable', function () {
            let chunk = socksRes.read();
            if (chunk) {
                let buffer = Buffer.alloc(chunk.length, chunk);
                res.write(buffer);
            }
        });
        socksRes.on('end', function () {
            res.end();
        });
    });
});


app.get('/file_id/*', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    let file_id = req.params[0];
    if(file_id !== 'null')
    bot.getFilePath(file_id)
        .then(botRes => {
            console.log(botRes);
            if (res.error) {
                console.log(botRes);
                res.sendStatus(404);
            } else
                res.send({path: botRes});
        });
    else res.sendStatus(404);
});


module.exports = app;

process.on('uncaughtException', function(err) {
    console.log(err);
});