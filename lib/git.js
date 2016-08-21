var $ = require('co')
var path = require('path')
var git = require('nodegit')
var lab = require('linco.lab')
var date = require('date-format');
var Config = require('vpm-config')
var is = require('aimee-is')
var Gre = require('gre')
var gre = Gre.create('[:time[yyyy-MM-dd hh:mm:ss]][:title][:git] :message')

class Git {
    constructor(options) {
        this.git = git;
        this.CONFIG = new Config;
        this.CONFIG.init(options);
        this.CONFIG.merge({
            checkoutOptions: {
                // 强制性检出 用于回滚 必须参数
                checkoutStrategy: git.Checkout.STRATEGY.FORCE
            }
        });
        this.config = this.CONFIG.get();
    }

    // 检查本地Repository是否已存在
    isRepository(target) {
        target = target || this.config.target
        return lab.isDir(target) && lab.isDir(path.join(target, '.git'))
    }

    // 查询本地Repository
    // 不存在则从中心库Clone
    repo() {
        return new Promise((res, rej) => {
            $.call(this, function *(){
                try{
                    this.repository = this.isRepository() ?
                        yield git.Repository.open(this.config.target):
                        yield git.Clone(this.config.url, this.config.target);
                    this.opened = true
                    res(this.repository)
                }
                catch(e){
                    rej(e)
                }
           })
        })
    }

    // 从中心库更新到本地
    fetch() {
        return this.repository.fetchAll();
    }

    // 合并更新到Master
    merge() {
        return this.repository.mergeBranches("master", "origin/master");
    }

    // Fetch & Merge
    pull() {
        return new Promise((res, rej) => {
            $.call(this, function *(){
                yield this.fetch()
                yield this.merge()
                res(this.repository)
            })
        })
    }

    // 查询Master最新Commit
    commit() {
        return this.repository.getBranchCommit("master")
    }

    // 切换到Master分支
    master() {
        return this.repository.checkoutBranch('master', this.config.checkoutOptions)
    }

    // 切换到最新Commit
    last() {
         return new Promise((res, rej) => {
            $.call(this, function *(){
                var commit = yield this.commit()
                var lasted = yield git.Checkout.tree(this.repository, commit, this.config.checkoutOptions)
                var result = this.repository.setHeadDetached(commit)
                result == 0 ? res(this.repository) : rej(result)
            })
        })
    }

    // 回滚到指定Tag
    goto(tag) {
        return new Promise((res, rej) => {
            $.call(this, function *(){
                if(is.string(tag)){
                    tag = yield this.repository.getTagByName(tag)
                }
                var tree = yield git.Checkout.tree(this.repository, tag, this.config.checkoutOptions)
                var result = this.repository.setHeadDetached(tag)
                result == 0 ? res(this.repository) : rej(result)
            })
        })
    }

    tags() {
        return git.Tag.list(this.repository)
    }

    // 查询最后一个tag
    getLastTag() {
        return new Promise((res, rej) => {
            $.call(this, function *(){
                var tags = yield this.tags()
                var tag = tags.length === 0 ?
                    undefined:
                    yield this.repository.getTagByName(tags[tags.length-1])
                res(tag)
            })
        })
    }

    rollback(tagName) {
        return this.goto(tagName)
    }

    // 发布
    publish(msg) {
        msg = msg || 'Publish By Program'
        return new Promise((res, rej) => {
            $.call(this, function *(){
                var tag;
                // 最新的Commit
                var commit = yield this.commit()
                // 最新的Tag
                var lastTag = yield this.getLastTag()
                // 对比Oid是否一致
                lastTag && commit.id().equal(lastTag.targetId()) ?
                    // 返回最新的Tag
                    tag = lastTag:
                    // 创建新的Tag
                    tag = yield this.repository.createTag(commit.id(), this.getNewTag(), msg);
                // 跳转到目标Tag
                yield this.goto(tag)
                res(tag)
            })
        })
    }

    // 生成新的TagName
    getNewTag(){
        return 'v' + date('yyyyMMdd-hhmmss-SSS')
    }
}

module.exports = Git











































//
