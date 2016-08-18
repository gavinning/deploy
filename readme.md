deploy
---

### Install
```sh
$ npm i aimee-deploy --save
```
```sh
$ npm i co gre --save
$ npm i pm2 -g
```

### Usage
```js
var $ = require('co');
var Gre = require('gre')
var gre = Gre.create('[:time][:title][:git] :message')
var Deploy = require('deploy');
var deploy = new Deploy({
    git: {
        url: 'https://github.com/gavinning/deploy-test.git',
        target: '/Users/gavinning/Desktop/test1234'
    },
    pm: {
        name: 'test',
        // 可选，为空时自动赋值为 this.git.target
        script: '/Users/gavinning/Desktop/test1234',
        exec_mode : 'cluster',        // Allow your app to be clustered
        instances : 1,                // Optional: Scale your app by 4
        max_memory_restart : '100M'
    }
})
```

### Example
```js
$(function *(){
    try{
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
```

```sh
$ pm2 ls
```
