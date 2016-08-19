var fs = require('fs-extra')
var PM = require('./lib/pm')
var Git = require('./lib/git')
var Npm = require('./lib/npm')
var Config = require('vpm-config')
var $ = require('co')
var Gre = require('gre');
var gre = Gre.create('[:time][:title][:pm2] :message');

class Deploy {
    constructor(options) {
        this.CONFIG = new Config;
        this.CONFIG.init(options);
        this.config = this.CONFIG.get();
        if(!this.config.pm.script){
            this.config.pm.script = this.config.git.target
        }
        this.config.npm = {
            target: this.config.git.target
        }
        this.pm = new PM(this.config.pm)
        this.git = new Git(this.config.git)
        this.npm = new Npm(this.config.npm)
    }

    clean() {
        return new Promise((res, rej) => {
            fs.remove(this.config.git.target, err => {
                err ? rej(err) : res()
            })
        })
    }

    publish() {
        return new Promise((res, rej) => {
            $.call(this, function *(){
                try{
                    gre.info('Deploy start...')
                    gre.info('Deploy connect repository')
                    yield this.git.repo()

                    gre.info('Deploy pull repository')
                    yield this.git.pull()

                    gre.info('Deploy publish repository')
                    yield this.git.publish()

                    gre.info('Deploy install dependencies...')
                    yield this.npm.install()

                    gre.info('Deploy connect pm2')
                    yield this.pm.connect()

                    gre.info('Deploy start', this.config.pm.name)
                    yield this.pm.start()

                    gre.info('Deploy close pm2 connect', this.config.pm.name)
                    this.pm.disconnect()

                    gre.info('Deploy all process done!')
                    res()
                }
                catch(e){
                    rej(e)
                }
            })
        })
    }

    rollback(tagName) {
        return this.goto(tagName)
    }

    goto(tagName) {
        return new Promise((res, rej) => {
            $.call(this, function *(){
                try{
                    // 连接git仓库
                    gre.info('Deploy start...')
                    gre.info('Deploy connect repository')
                    yield this.git.repo()

                    // 回滚到指定版本
                    gre.info('Deploy rollback repository')
                    yield this.git.rollback(tagName)

                    // 连接pm2
                    gre.info('Deploy connect pm2')
                    yield this.pm.connect()

                    // 启动app
                    gre.info('Deploy start', this.config.pm.name)
                    yield this.pm.start()

                    // 关闭pm2连接
                    gre.info('Deploy close pm2 connect', this.config.pm.name)
                    this.pm.disconnect()

                    gre.info('Deploy all process done!')
                }
                catch(e){
                    console.log(e.message)
                }
            })
        })
    }
}

module.exports = Deploy
