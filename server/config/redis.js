'use strict';

var config = require('.');
var redis = require('redis');
var _ = require('lodash');
var Q = require('q');


// https://gist.github.com/tobiash/2884566
var nbindOps = function (client) {
  var functions = _.functions(client);

  var p = {};
  var ops = functions.filter(function (f) {
    return f.toUpperCase() === f;
  });

  var lc = (function () {
    var result = [];
    ops.forEach(function (op, index) {
      this[index] = op.toLowerCase();
    }, result);
    return result;
  }());

  ops = ops.concat(lc);

  ops.forEach(function (op) {
    this[op] = Q.nbind(client[op], client);
  }, p);

  p.multi = p.MULTI = function () {
    var m = client.multi.call(client, arguments);
    m.exec = Q.nbind(m.exec, m);

    return m;
  };

  return p;
};
/* var nbind = function(client) {
    client.q = nbindOps(client);
    return client;
};*/


var redisClient = redis.createClient(config.redis.port, config.redis.host, config.redis.options);

redisClient.on('connect', function () {
  // console.log('Running Redis '+redisClient.address);
}).on('ready', function () {
  console.log('Running Redis Version ' + redisClient.server_info.redis_version);
}).on('error', function (err) {
  console.error(err);
});

module.exports = nbindOps(redisClient);
