'use strict';

var config = require('./env')
  , redis = require('redis')
  , _ = require('underscore')
  , Q = require('q');


// https://gist.github.com/tobiash/2884566
var nbindOps = function(client) {
    var functions = _.functions(client);

    var ops = functions.filter(function(f) {
        return f.toUpperCase() === f;
    });

    var lc = (function() {
        var result = [];
        ops.forEach(function(op, index) {
            this[index] = op.toLowerCase();
        }, result);
        return result;
    })();

    var ops = ops.concat(lc);

    var p = {};
    ops.forEach(function(op, index) {
        this[op] = Q.nbind(client[op], client);
    }, p);

    p['multi'] = p['MULTI'] = function() {
        var m = client.multi.call(client, arguments);
            m.exec = Q.nbind(m.exec, m);
            
        return m;
    };

    return p;
};
/*var nbind = function(client) {
    client.q = nbindOps(client);
    return client;
};*/


var redisClient = redis.createClient(config.redis.port, config.redis.host, config.redis.options);

redisClient.on('connect', function() {
    // console.log('Running Redis '+redisClient.address);
    /*redisClient.flushdb(function(err, result) {
        // 서버 재시작 시 접속 중인 사용자가 페이지 갱신될 때
        // db0에 socket.io 연결 정보가 남아, 중복 접속으로 처리되어 db0을 비우고 시작
    });*/
}).on('ready', function() {
    console.log('Running Redis Version '+redisClient.server_info.redis_version);
}).on('error', function(err) {
    console.error(err);
});

module.exports = nbindOps(redisClient);