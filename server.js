'use strict';

var d = require('domain').create();
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var config = require('./server/config');
// var logger = require('./server/config/logger');

// process.on('uncaughtException')
d.on('error', function (err) {
  console.error(err.stack);
});

d.run(function () {
  var server;

  mongoose.connect(config.mongo.uri, config.mongo.options);
  mongoose.connection.on('connected', function () {
    console.log('Running Mongoose Version ' + mongoose.version);
  }).on('error', function (err) {
    console.error(err);
  }).on('disconnected', function () {
    // console.log('Mongoose Disconnected');
  });

  autoIncrement.initialize(mongoose.connection);

  // bootstrap: Express, Models, Routes
  server = require('./bootstrap')().listen(config.port, function () {
    console.log('Current Environment: ', config.env);
    console.log('Running Express on Port ' + config.port + ', ' + Date());
  });

  // var redis = require('./server/config/redis');
  require('./server/config/socket.io')(server);
});


/* var cluster = require('cluster');
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
