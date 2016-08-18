var pm = require('pm2');
var Config = require('vpm-config');

class PM {
    constructor(options) {
        this.pm = pm;
        this.CONFIG = new Config;
        this.CONFIG.init(options);
        this.config = this.CONFIG.get();
    }

    connect() {
        return new Promise((res, rej) => {
            pm.connect(err => {
                if (err) {
                    gre.error(err);
                    rej(err);
                    process.exit(2);
                }
                pm.connected = true;
                res(pm)
            })
        })
    }

    start() {
        return new Promise((res, rej) => {
            pm.start(this.config, (err, apps) => {
                err ? rej(err) : res(apps)
            })
        })
    }

    disconnect() {
        pm.disconnect()
    }
};

[
    'list',
    'dump',
    'startup',
    'launchBus',
    'reloadLogs',
    'killDaemon',
    'sendSignalToProcessName'
].forEach(key => {
    PM.prototype[key] = function(){
        return new Promise((res, rej) => {
            let arr = Array.from(arguments);
            let fn = function(){
                let args = Array.from(arguments);
                let err = args.shift();
                err ? rej(err) : res.apply(null, args);
            }
            typeof arr[arr.length-1] === 'function' ? arr.pop() : arr;
            arr.push(fn)
            pm[key].apply(pm, arr)
        })
    }
});

[
    'stop',
    'flush',
    'delete',
    'restart',
    'describe',
    'gracefulReload'
].forEach(key => {
    PM.prototype[key] = function(){
        return new Promise((res, rej) => {
            pm[key](this.config.name, function(){
                let args = Array.from(arguments);
                let err = args.shift();
                err ? rej(err) : res.apply(null, args);
            })
        })
    }
});

module.exports = PM
