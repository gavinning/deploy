var $ = require('co')
var Deploy = require('../app')
var Gre = require('gre');
var gre = Gre.create('[:time][:title][:pm2] :message');

var deploy = new Deploy({
    git: {
        // url: 'https://github.com/gavinning/deploy-test.git',
        url : '/Users/gavinning/Documents/lab/github/deploy-test',
        target: '/Users/gavinning/Desktop/test1234'
    },
    pm: {
        name: 'rong',
        exec_mode : 'cluster',        // Allow your app to be clustered
        instances : 1,                // Optional: Scale your app by 4
        max_memory_restart : '200M'
    }
})

$(function *(){
    try{
        yield deploy.clean()

        gre.info('Deploy start...')
        gre.info('Deploy connect repository')
        yield deploy.git.repo()

        gre.info('Deploy pull repository')
        yield deploy.git.pull()

        gre.info('Deploy publish repository')
        yield deploy.git.publish()

        gre.info('Deploy connect pm2')
        yield deploy.pm.connect()

        gre.info('Deploy start', deploy.config.pm.name)
        yield deploy.pm.start()

        var list = yield deploy.pm.list()
        deploy.pm.disconnect()
        console.log(list.length)
        gre.info('Deploy done')
    }
    catch(e){
        console.log(e.message)
    }
})
