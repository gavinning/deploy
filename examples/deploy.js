var $ = require('co')
var Deploy = require('../app')
var Gre = require('gre');
var gre = Gre.create('[:time][:title] :message');

var deploy = new Deploy({
    git: {
        url: '/Users/gavinning/Desktop/test',
        target: '/Users/gavinning/Desktop/test1234'
    },
    pm: {
        name: 'rong',
        exec_mode : 'cluster',        // Allow your app to be clustered
        instances : 1,                // Optional: Scale your app by 4
        max_memory_restart : '200M'
    }
})

deploy.publish()

// deploy.rollback('v20160819-180205-084')
