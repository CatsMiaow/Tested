'use strict';

var passport = require('passport')
  , mongoose = require('mongoose')
  , _        = require('underscore')
  , User = mongoose.model('User');


var userControllers = {
    create: function(req, res) {
        var user = new User(req.body);
            user.ip = req.connection.remoteAddress; // req.ip

        User.is('_id', user._id).then(function(count) {
            if (count > 0) { throw new Error('_id'); }

            return User.is('nickname', user.nickname);
        }).then(function(count) {
            if (count > 0) { throw new Error('nickname'); }

            return User.is('email', user.email);
        }).then(function(count) {
            if (count > 0) { throw new Error('email'); }

            return user.save();
        }).then(function(result, affected) {
            res.sendStatus(200);
        }).then(null, function(err) {
            res.status(err.code ? 500 : 409).send(err.message);
        });
    },
    read: function(req, res) {
        User.get(req.user.id, '-_id nickname email').then(function(user) {
            if (!user) {
                throw new Error('회원 정보가 존재하지 않습니다.');
            }

            res.json(user);
        }).then(null, function(err) {
            res.status(err.code ? 500 : 400).send(err.message);
        });
    },
    update: function(req, res) {
        var user;
        // autoIncrement의 키가 되는 serial를 select 하지 않으면 update에서 값이 증가하므로 필수로 select
        User.get(req.user.id, 'serial nickname email password').then(function(row) {
            user = row;

            return (user.nickname == req.body.nickname) ? 0 : User.is('nickname', req.body.nickname);
        }).then(function(count) {
            if (count > 0) { throw new Error('nickname'); }

            return (user.email == req.body.email) ? 0 : User.is('email', req.body.email);
        }).then(function(count) {
            if (count > 0) { throw new Error('email'); }

            user = _.extend(user, req.body);
            return user.save();
        }).then(function(result, affected) {
            req.logout(); // 회원 정보 업데이트 시 재로그인
            res.sendStatus(200);
        }).then(null, function(err) {
            res.status(err.code ? 500 : 409).send(err.message);
        });
    },
    remove: function(req, res) {
        // var user = req.user;

        // user.remove(function(err) {
        //     if (err) { return res.status(500).send(err); }

        //     res.sendStatus(200);
        // });
        res.sendStatus(403);
    },
    login: function(req, res, next) {
        passport.authenticate('local', function(err, user, reason) {
            if (err) { return next(err) }
            
            if (!user || reason) {
                // req.session.messages = [reason.message];
                return res.status(400).send(reason.message);
            }

            var userData = { // 세션에 저장할 데이터
                id   : user.id,
                level: user.level,
                name : user.nickname,
                email: user.email
            };

            req.logIn(userData, function(err) {
                if (err) { return next(err); }

                return res.json(userData);
            });
        })(req, res, next);
    },
    logout: function(req, res) {
        req.logout();
        res.sendStatus(200);
    },
};


module.exports = userControllers;