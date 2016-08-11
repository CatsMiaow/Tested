import _ from 'lodash';
import passport from 'passport';
import mongoose from '../config/mongo';
import { wrap, async } from '../modules';

const User = mongoose.model('User');

export default {
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
   * @apiError DuplicatedId 중복된 아이디
   * @apiError DuplicatedNickname 중복된 닉네임
   * @apiError DuplicatedEmail 중복된 이메일
   */
  create: wrap(async(function* (req, res) {
    const user = new User(req.body);
    user.ip = req.ip;

    // 아이디
    let count = yield User.is('_id', user._id);
    if (count > 0) {
      throw new Error('DuplicatedId');
    }
    // 닉네임
    count = yield User.is('nickname', user.nickname);
    if (count > 0) {
      throw new Error('DuplicatedNickname');
    }
    // 이메일
    count = yield User.is('email', user.email);
    if (count > 0) {
      throw new Error('DuplicatedEmail');
    }

    yield user.save();

    res.sendStatus(200);
  })),
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
  read: wrap(async(function* (req, res) {
    const user = yield User.get(req.user.id, '-_id nickname email');
    if (!user) {
      throw new Error('NoResult');
    }

    res.json(user);
  })),
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
   * @apiError DuplicatedNickname 중복된 닉네임
   * @apiError DuplicatedEmail 중복된 이메일
   */
  update: wrap(async(function* (req, res) {
    // autoIncrement의 키가 되는 serial를 select 하지 않으면 update에서 값이 증가하므로 필수로 select
    let user = yield User.get(req.user.id, 'serial nickname email password');
    let count = 1;

    // 닉네임
    if (user.nickname !== req.body.nickname) {
      count = yield User.is('nickname', req.body.nickname);
      if (count > 0) {
        throw new Error('DuplicatedNickname');
      }
    }
    // 이메일
    if (user.email !== req.body.email) {
      count = yield User.is('email', req.body.email);
      if (count > 0) {
        throw new Error('DuplicatedEmail');
      }
    }

    user = _.extend(user, req.body);
    yield user.save();

    req.logout(); // 회원 정보 업데이트 시 재로그인
    res.sendStatus(200);
  })),
  /**
   * @apiIgnore 탈퇴 기능이 없으므로 사용되지 않음
   * @api {delete} /user 회원 탈퇴
   * @apiName DeleteUser
   * @apiGroup User
   * @apiPermission user
   * @apiDescription 회원을 탈퇴한다.
   * @apiUse DefaultError
   */
  remove(req, res) {
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
  login(req, res, next) {
    passport.authenticate('local', (err, user, reason) => {
      if (err) {
        return next(err);
      }

      if (!user || reason) {
        return res.status(400).json(reason);
      }

      const userData = { // 세션에 저장할 데이터
        id: user.id,
        level: user.level,
        name: user.nickname,
        email: user.email };

      return req.logIn(userData, err2 => {
        if (err2) {
          return next(err2);
        }

        return user.update({ // 로그인 정보 업데이트
          logined: new Date(),
          loginip: req.ip,
        }, err3 => {
          if (err3) {
            return next(err3);
          }

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
  logout(req, res) {
    req.logout();
    res.sendStatus(200);
  },
};
