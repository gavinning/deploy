var fs = require('fs-extra')
var PM = require('./lib/pm')
var Git = require('./lib/git')
var Config = require('vpm-config')

class Deploy {
    constructor(options) {
        this.CONFIG = new Config;
        this.CONFIG.init(options);
        this.config = this.CONFIG.get();
        if(!this.config.pm.script){
            this.config.pm.script = this.config.git.target
        }
        this.pm = new PM(this.config.pm)
        this.git = new Git(this.config.git)
    }

    clean() {
        return new Promise((res, rej) => {
            fs.remove(this.config.git.target, err => {
                err ? rej(err) : res()
            })
        })
    }

    reset() {

    }
}

module.exports = Deploy
