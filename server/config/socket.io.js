'use strict';

var sio = require('socket.io');
var adapter = require('socket.io-redis');
var redis = require('redis');
var config = require('.');


module.exports = function (server) {
  var io = sio(server, {
    transports: ['websocket'] });

  var redisAdapter = adapter({
    pubClient: redis.createClient(config.redis.port, config.redis.host),
    subClient: redis.createClient(config.redis.port, config.redis.host, { return_buffers: true })
  });
  redisAdapter.pubClient.on('error', function (err) {
    console.error('pubClient', err);
  });
  redisAdapter.subClient.on('error', function (err) {
    console.error('subClient', err);
  });

  // Redis Store
  io.adapter(redisAdapter);

  io.use(function (socket, next) {
    var data = socket.request;

    if (data.headers.cookie) {
      data.cookie = require('cookie').parse(data.headers.cookie);

      if (!data.cookie['connect.sid']) {
        next(new Error('No session transmitted.'));
      }
    } else {
      next(new Error('No cookie transmitted.'));
    }

    next();
  });

  io.on('connection', function (socket) {
    // socket.id
    // socket.request.connection.remoteAddress
    // socket.request.headers['user-agent']
    // io.sockets.connected[client].disconnect();
    io.emit('user:count', io.eio.clientsCount);

    socket.on('disconnect', function () {
      socket.broadcast.emit('user:count', io.eio.clientsCount);
    });
  });

  return io;
};
