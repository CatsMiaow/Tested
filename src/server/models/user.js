// http://devsmash.com/blog/implementing-max-login-attempts-with-mongoose

import bcrypt from 'bcrypt';
import mongoose, { autoIncrement } from '../config/mongo';

const SALT_WORK_FACTOR = 10; // 비밀번호 생성 키 자리수
const MAX_LOGIN_ATTEMPTS = 5; // 로그인 시도 제한수
const LOCK_TIME = 1 * 60 * 60 * 1000; // 1 hour, 로그인 잠금 시간

const UserSchema = new mongoose.Schema({
  _id: { type: String, match: /^[a-z0-9]{4,15}$/ },
  serial: { type: Number, unique: true },
  level: { type: Number, default: 2 },
  nickname: { type: String, unique: true, match: /^.{2,15}$/ },
  email: { type: String, unique: true, trim: true },
  password: { type: String, required: true, trim: true },
  ip: { type: String },
  logined: { type: Date },
  loginip: { type: String },
  loginAttempt: { type: Number, default: 0 },
  lockUntil: { type: Number },
  seceded: { type: Date },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

// 환경변수 참조
const reasons = UserSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
  MAX_ATTEMPTS: 2 };

// 가상 변수 생성
UserSchema.virtual('isLocked').get(function () {
  // 로그인 잠금 여부 리턴, !!는 Boolean 리턴
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// 데이터 저장 전에 수행함
UserSchema.pre('save', function (next) {
  const user = this;

  // 수정할 때
  if (!user.isNew) {
    user.updated = new Date();
  }

  if (!user.isModified('password')) {
    return next();
  }

  // 암호 키 생성
  return bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) {
      return next(err);
    }
    // 비밀번호 해시
    return bcrypt.hash(user.password, salt, (error, hash) => {
      if (error) {
        return next(error);
      }
      // 암호화된 비밀번호 적용
      user.password = hash;
      return next();
    });
  });
});

// 모델에서 사용할 함수 생성
UserSchema.method({
  // 비밀번호 비교
  comparePassword(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) {
        return callback(err);
      }
      return callback(null, isMatch);
    });
  },
  // 로그인 시도 횟수 증가
  incLoginAttempt(callback) {
    // 로그인 잠금 시간이 지났을 때 횟수 초기화
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.update({
        $set: { loginAttempt: 1 },
        $unset: { lockUntil: 1 },
      }, callback);
    }
    // 시도 횟수 증가
    const updates = { $inc: { loginAttempt: 1 } };
    // 로그인 시도 초과 시 잠금 시간 설정
    if (this.loginAttempt + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
      updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }

    return this.update(updates, callback);
  },
});

// 컨트롤러에서 사용할 인증 함수 생성
UserSchema.static({
  // 회원 아이디와 비밀번호 인증
  getAuthenticated(id, password, callback) {
    this.findOne({ _id: id }, (err, user) => {
      if (err) {
        return callback(err);
      }
      // 회원정보 없음
      if (!user) {
        return callback(null, null, reasons.NOT_FOUND);
      }
      // 로그인 잠금 시
      if (user.isLocked) {
        // 로그인 시도 횟수 증가
        return user.incLoginAttempt(err2 => {
          if (err2) {
            return callback(err2);
          }
          return callback(null, null, reasons.MAX_ATTEMPTS);
        });
      }

      // 비밀번호 매칭
      return user.comparePassword(password, (err3, isMatch) => {
        if (err3) {
          return callback(err3);
        }
        // 비밀번호가 맞다면
        if (isMatch) {
          // 로그인을 실패한 경우가 없었을 때
          if (!user.loginAttempt && !user.lockUntil) {
            return callback(null, user);
          }
          // 시도 및 잠금 시간 초기화
          return user.update({
            $set: { loginAttempt: 0 },
            $unset: { lockUntil: 1 },
          }, err4 => {
            if (err4) {
              return callback(err4);
            }
            return callback(null, user);
          });
        }

        // 비밀번호가 틀리면 로그인 시도 횟수 증가
        return user.incLoginAttempt(err5 => {
          if (err5) {
            return callback(err5);
          }
          return callback(null, null, reasons.PASSWORD_INCORRECT);
        });
      });
    });
  },
});


/* <컨트롤러모델함수> */
UserSchema.static({
  get(id, field) {
    return this.findOne({ _id: id }, field);
  },
  is(field, value) {
    return this.count({ [field]: value });
  },
});
/* </컨트롤러모델함수> */


UserSchema.plugin(autoIncrement.plugin, {
  model: 'User', field: 'serial', startAt: 1 });

export default mongoose.model('User', UserSchema);
