let express = require('express'),
    bodyParser = require('body-parser'),
    app = express();

const BOT = require('./bot').Bot,
    AGENT = require('socks5-https-client/lib/Agent'),
    CONFIG = require('./config'),
    TOKEN = CONFIG.bot.TOKEN,
    OPTIONS = {
    webHook: {
        endpoint: '/chat',
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
    mainBase: CONFIG.bot.mainBase
};

let bot = new BOT(TOKEN,OPTIONS);

bot.setWebHook('https://egorchepiga.ru/chat/');
bot.watch();

app.use(bodyParser.json());
app.get(`/`, (req, res) => {
    let user_id = req.param('user_id') || 0;
    let token = req.param('token') || 0;
    res.setHeader('Content-Type', 'application/json');
    bot.analyze(user_id, token)
        .then(botRes => {
        if (botRes.error){
            console.log(botRes);
            res.sendStatus(401);
        } else res.send(JSON.stringify(botRes));
    });

});

port = 3000;
app.listen(port, () => {
    console.log(`Express server is listening on ${port}`);
});

module.exports = app

process.on('uncaughtException', function(err) {
    console.log(err);
});