'use strict';

var indexControllers = {
    render: function(req, res) {
        res.render('index');
    },
    views: function(req, res) {
        res.render(req.params[0]);
    },
    session: function(req, res) {
        res.json(req.user);
    },
    health: function(req, res) {
        res.status(200).send(new Buffer(JSON.stringify({
            pid: process.pid,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        })));
    },
    html5Mode: function(req, res, next) {
        if (req.path.indexOf('/v/') === 0) { // API 주소 통과, req.query.t
            return next();
        }
        
        res.render('index');
    },
    init: function(req, res) {
        var mongoose = require('mongoose')
          , Board = mongoose.model('Board')
          , User = mongoose.model('User')
          , Q = require('q');

        Board.where('_id').in(['notice', 'talk']).exec('count').then(function(count) {
            if (count > 0) {
                throw new Error('Already Exists.');
            }
            // 기본 게시판, 관리자 추가
            return Q.all([
                new Board({
                    _id: 'notice',
                    title: '공지사항',
                    writeLevel: 10
                }).save(),
                new Board({
                    _id: 'talk',
                    title: '자유게시판'
                }).save(),
                new User({
                    _id: 'admin',
                    level: 10,
                    nickname: '관리자',
                    email: 'admin@tested.co.kr',
                    password: 'password'
                }).save()
            ]);
        }).then(function(result) {
            res.json(result);
        }).then(null, function(err) {
            res.json(err.message);
        });
   }
};


module.exports = indexControllers;