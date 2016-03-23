'use strict';

var passport = require('passport');
var mongoose = require('mongoose');
var _ = require('lodash');
var User = mongoose.model('User');


var userControllers = {
  /**
   * @api {post} /user 회원 등록
   * @apiName PostUser
   * @apiGroup User
   * @apiDescription 회원을 등록한다.
   * @apiParam (Body) {String{4..15}} _id 영문 소문자와 숫자로 조합된 아이디
   * @apiParam (Body) {String{2..15}} nickname 닉네임
   * @apiParam (Body) {String} email 이메일
   * @apiParam (Body) {String} password 비밀번호
   * @apiUse DefaultError
   */
  create: function (req, res) {
    var user = new User(req.body);
    user.ip = req.connection.remoteAddress; // req.ip

    User.is('_id', user._id).then(function (count) {
      if (count > 0) { throw new Error('_id'); }

      return User.is('nickname', user.nickname);
    }).then(function (count) {
      if (count > 0) { throw new Error('nickname'); }

      return User.is('email', user.email);
    }).then(function (count) {
      if (count > 0) { throw new Error('email'); }

      return user.save();
    }).then(function () { // result, affected
      res.sendStatus(200);
    }).then(null, function (err) {
      res.status(err.code ? 500 : 409).send(err.message);
    });
  },
  /**
   * @api {get} /user 회원 정보
   * @apiName GetUser
   * @apiGroup User
   * @apiPermission user
   * @apiDescription 회원 정보 수정 시 데이터를 가져온다.
   * @apiSuccess {String} nickname 닉네임
   * @apiSuccess {String} email 이메일
   * @apiUse DefaultError
   */
  read: function (req, res) {
    User.get(req.user.id, '-_id nickname email').then(function (user) {
      if (!user) {
        throw new Error('회원 정보가 존재하지 않습니다.');
      }

      res.json(user);
    }).then(null, function (err) {
      res.status(err.code ? 500 : 400).send(err.message);
    });
  },
  /**
   * @api {put} /user 회원 수정
   * @apiName PutUser
   * @apiGroup User
   * @apiPermission user
   * @apiDescription 회원 정보를 수정한다.
   * @apiParam (Body) {String} nickname 닉네임
   * @apiParam (Body) {String} email 이메일
   * @apiParam (Body) {String} password 비밀번호
   * @apiUse DefaultError
   */
  update: function (req, res) {
    var user;
    // autoIncrement의 키가 되는 serial를 select 하지 않으면 update에서 값이 증가하므로 필수로 select
    User.get(req.user.id, 'serial nickname email password').then(function (row) {
      user = row;

      return (user.nickname === req.body.nickname) ? 0 : User.is('nickname', req.body.nickname);
    }).then(function (count) {
      if (count > 0) { throw new Error('nickname'); }

      return (user.email === req.body.email) ? 0 : User.is('email', req.body.email);
    }).then(function (count) {
      if (count > 0) { throw new Error('email'); }

      user = _.extend(user, req.body);
      return user.save();
    }).then(function () { // result, affected
      req.logout(); // 회원 정보 업데이트 시 재로그인
      res.sendStatus(200);
    }).then(null, function (err) {
      res.status(err.code ? 500 : 409).send(err.message);
    });
  },
  /**
   * @apiIgnore 탈퇴 기능이 없으므로 사용되지 않음
   * @api {delete} /user 회원 탈퇴
   * @apiName DeleteUser
   * @apiGroup User
   * @apiPermission user
   * @apiDescription 회원을 탈퇴한다.
   * @apiUse DefaultError
   */
  remove: function (req, res) {
    res.sendStatus(403);
  },
  /**
   * @api {post} /user/login 로그인
   * @apiName PostUserLogin
   * @apiGroup User
   * @apiDescription 회원 세션을 생성한다.
   * @apiParam (Body) {String} id 아이디
   * @apiParam (Body) {String} password 비밀번호
   * @apiSuccess {String} id 아이디
   * @apiSuccess {Number} level 레벨
   * @apiSuccess {String} name 닉네임
   * @apiSuccess {String} email 이메일
   * @apiUse DefaultError
   */
  login: function (req, res, next) {
    passport.authenticate('local', function (err, user, reason) {
      var userData;

      if (err) { return next(err); }

      if (!user || reason) {
        // req.session.messages = [reason.message];
        return res.status(400).send(reason.message);
      }

      userData = { // 세션에 저장할 데이터
        id: user.id,
        level: user.level,
        name: user.nickname,
        email: user.email };

      return req.logIn(userData, function (error) {
        if (error) { return next(error); }

        return User.update({ // 로그인 정보 업데이트
          logined: new Date(),
          loginip: req.connection.remoteAddress
        }, function (err2) {
          if (err2) { return next(err2); }

          return res.json(userData);
        });
      });
    })(req, res, next);
  },
  /**
   * @api {get} /user/logout 로그아웃
   * @apiName GetUserLogout
   * @apiGroup User
   * @apiPermission user
   * @apiDescription 회원 세션을 삭제한다.
   * @apiUse DefaultError
   */
  logout: function (req, res) {
    req.logout();
    res.sendStatus(200);
  }
};


module.exports = userControllers;
