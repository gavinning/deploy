var npm = require('npm')
var path = require('path')
var fs = require('fs-extra')
var Config = require('vpm-config');

class Npm {
    constructor(options) {
        this.npm = npm
        this.CONFIG = new Config
        this.CONFIG.init(options)
        this.config = this.CONFIG.get()
    }

    install() {
        return new Promise((res, rej) => {
            npm.load({ prefix: this.config.target }, err => {
                if(err)
                    rej(err)
                npm.commands.install(this.getDependencies(), function(err, data){
                    err ? rej(err) : res(data)
                })
            })
        })
    }

    getDependencies() {
        var arr = []
        var pkg = fs.readJsonSync(path.join(this.config.target, 'package.json'))
        var dependencies = pkg.dependencies
        for(var key in dependencies){
            arr.push([key, dependencies[key]].join('@'))
        }
        return arr
    }
}

module.exports = Npm
