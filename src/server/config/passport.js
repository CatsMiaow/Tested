import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import mongoose from './mongo';

const User = mongoose.model('User');

// 인증 성공 시 세션에 저장할 데이터 처리
passport.serializeUser((user, done) => {
  done(null, user);
});

// 인증되고 나서 페이지를 접속했을 때 데이터 처리, serializeUser의 데이터가 넘어옴
passport.deserializeUser((user, done) => {
  // 세션에 필요한 정보를 저장하므로 다시 DB를 거칠 필요는 없다.
  // .findById(id, (err, user) => done(err, user));
  done(null, user);
});

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'password',
  // passReqToCallback: true // request 리턴 여부
}, (id, password, done) => {
  User.getAuthenticated(id, password, (err, user, reason) => {
    const reasons = User.failedLogin;
    let message = null;

    if (err) {
      return done(err);
    }

    switch (reason) {
      case reasons.NOT_FOUND:
      case reasons.PASSWORD_INCORRECT:
        message = 'Invalid';
        break;
      case reasons.MAX_ATTEMPTS:
        message = 'AttemptsExceeded';
        break;
      // no default
    }

    if (reason || message) {
      return done(null, false, { message });
    }

    done(null, user);
  });
}));


export default {
  // 인증 여부 체크 메소드
  authenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    res.sendStatus(401);
  },
  // 관리자 체크 메소드( passport.authenticated, passport.ensureAdmin )
  ensureAdmin(req, res, next) {
    if (req.user && req.user.level >= 10) {
      return next();
    }

    res.sendStatus(403);
  },
};
