'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

// 인증 성공 시 세션에 저장할 데이터 처리
passport.serializeUser(function (user, done) {
  done(null, user);
});

// 인증되고 나서 페이지를 접속했을 때 데이터 처리, serializeUser의 데이터가 넘어옴
passport.deserializeUser(function (user, done) {
  // 세션에 필요한 정보를 저장하므로 다시 DB를 거칠 필요는 없다.
  // .findById(id, function(err, user) { done(err, user); });
  done(null, user);
});

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'password'
  // passReqToCallback: true // request 리턴 여부
}, function (id, password, done) {
  User.getAuthenticated(id, password, function (err, user, reason) {
    var reasons = User.failedLogin;
    var msg;

    if (err) {
      return done(err);
    }

    switch (reason) {
      case reasons.NOT_FOUND:
      case reasons.PASSWORD_INCORRECT:
        msg = '아이디 또는 비밀번호가 잘못되었습니다. 다시 확인하세요.';
        break;
      case reasons.MAX_ATTEMPTS:
        msg = '로그인 최대 시도 횟수를 초과하여 로그인할 수 없습니다. 나중에 다시 시도하세요.';
        break;
      // no default
    }

    if (reason || msg) {
      return done(null, false, { message: msg });
    }

    return done(null, user);
  });
}));

// 인증 여부 체크 메소드
exports.authenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.sendStatus(401);
};


// 관리자 체크 메소드( passport.authenticated, passport.ensureAdmin )
exports.ensureAdmin = function (req, res, next) {
  if (req.user && req.user.level >= 10) {
    return next();
  }

  return res.sendStatus(403);
};
