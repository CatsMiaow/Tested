'use strict';

var d = require('domain').create()
  , mongoose = require('mongoose')
  , autoIncrement = require('mongoose-auto-increment')
  , config  = require('./server/config/env');

// process.on('uncaughtException')
d.on('error', function(err) {
    console.error(err.stack);
});

d.run(function() {
    var mongo;
    var connectMongoDB = function() {
        // if (config.env === 'development') { }
        mongo = mongoose.connect(config.mongo.uri, config.mongo.options);
        autoIncrement.initialize(mongo);
    };

    mongoose.connection.on('connected', function() {
        console.log('Running Mongoose Version '+mongoose.version);
    }).on('error', function(err) {
        console.error(err);
    }).on('disconnected', function() {
        // console.log('Mongoose Reconnect!!');
        // connectMongoDB();
    });

    connectMongoDB();

    // Express, Models, Routes
    var app = require('./bootstrap')(mongo);
    var server = app.listen(config.port, function() {
        // console.log('Current Environment: ', config.env);
        console.log('Running Express on Port '+config.port+', '+Date());
    });

    // 글로벌 변수 설정, 대문자로
    global.REDIS = require('./server/config/redis');
    global.IO = require('./server/config/socket.io')(server);
});


/*var cluster = require('cluster');
if (cluster.isMaster) {
    var numCPUs = require('os').cpus().length;
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('fork', function(worker) {
        console.log('Worker %d fork %d', worker.id, worker.process.pid);
    }).on('online', function(worker) {
        console.log('Worker %d online', worker.id);
    }).on('listening', function(worker, address) {
        console.log('Worker %d listening', worker.id);
    }).on('disconnect', function(worker) {
        console.log('Worker %d disconnect', worker.id);
    }).on('exit', function(worker, code, signal) {
        console.log('Worker %d died (%s)', worker.process.pid, signal || code);
        // if (!worker.suicide) { cluster.fork(); }
        cluster.fork();
    }).on('setup', function() {
        console.log('Cluster Setup');
    });
} else if (cluster.isWorker) {
    //
}*/