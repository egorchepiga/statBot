const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    app = express(),
    log = require('./logger').log;


const Bot = require('./bot').Bot;
let bot = new Bot();

bot.setWebHook('https://egorchepiga.ru/chat/');
bot.watch();

app.use(bodyParser.json());
app.get(`/`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    bot.analyze().then(botRes => {
        if (botRes.error){
            console.log(botRes);
            res.sendStatus(404);
        }
        res.send(JSON.stringify(botRes));
    });

});

port = 3000;
app.listen(port, () => {
    console.log(`Express server is listening on ${port}`);
});

module.exports = app