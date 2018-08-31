let express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    https = require('https'),
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
};

let bot = new BOT(TOKEN,OPTIONS);

bot.setWebHook('https://egorchepiga.ru/tg-hook/');
bot.watch();

app.use(bodyParser.json());
app.get(`/analyze/`, (req, res) => {
    let token = req.param('token');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    bot.analyze(token)
        .then(botRes => {
            if (botRes.error) {
                console.log(botRes);
                res.sendStatus(401);
            } else {
                res.send(JSON.stringify(botRes));
            }
        });
});

app.get(`/chats/`, (req, res) => {
    let token = req.param('token');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    bot.getChats(token)
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

let port = 3002;
app.listen(port, () => {
    console.log(`http server is listening on ${port}`);
});


let key = fs.readFileSync(CONFIG.bot.privkey),
    cert = fs.readFileSync(CONFIG.bot.cert),
    httpsServer = https.createServer({key: key, cert: cert}, app),
    SSLport = 3000;
httpsServer.listen(3000, () => {
    console.log(`https server is listening on ${SSLport}`);
});




module.exports = app;

process.on('uncaughtException', function(err) {
    console.log(err);
});