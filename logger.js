let fs = require('fs'),
    logDir = '../log/';
    //chatops = require('./chatops');


module.exports = {
    log: log
};

function log(type, info, error) {
    let date = new Date(),
        res = {
            type : type,
            info : info,
            date : date,
            stackTrace : error.stack
        };
    console.log(res);
    toFile(res);

    /*switch (type) {
        case 'WARN':
            chatops.notify(res);
            console.log(res);
            break;

        case 'ERROR':
            console.log(res);
            chatops.notify(res);
            break;

        case 'INFO':
            break;

        case 'TRACE':
            console.log(res);
            break;

        default:
    }*/
}

function toFile(log) {
    for(prop in log) {
        log.prop = prop.replace(/('")/gim, '\"');
    }
    return new Promise((resolve, reject) => {
        let date = new Date(),
            json_path  = logDir + date.getDate() +"_"+ (date.getMonth()+1) +"_"+ date.getFullYear() + ".json",
            jsonLog;

        if (!fs.existsSync(json_path)) {
            jsonLog = { "log": [] };
            jsonLog.log.push(log);
            fs.writeFile(json_path,JSON.stringify(jsonLog), (err) => {
                (err) ? resolve(err) : resolve(true);
            });
        } else {
            jsonLog = JSON.parse(fs.readFileSync(json_path));
            jsonLog.log.push(log);
            fs.writeFile(json_path,JSON.stringify(jsonLog), (err) => {
                (err) ? resolve(err) : resolve(true);
            });
        }
    });
}