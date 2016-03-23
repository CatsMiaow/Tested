'use strict';

describe('User API', function () {
  describe('POST /user - 회원 등록', function () {
    it('mocha 아이디를 생성한다.', function (done) {
      request.post('/user')
        .send({
          _id: 'mocha',
          nickname: 'mocha',
          email: 'mocha@tested.co.kr',
          password: 'mocha123'
        }).expect(200, done);
    });
  });

  describe('POST /user/login - 로그인', function () {
    it('mocha 아이디로 로그인한다.', function (done) {
      request.post('/user/login')
        .send({ id: 'mocha', password: 'mocha123' })
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.should.to.have.property('id');
          return done();
        });
    });
  });

  describe('PUT /user - 회원 수정', function () {
    it('모촤로 닉네임을 변경한다.', function (done) {
      request.put('/user')
        .send({
          nickname: '모촤',
          email: 'mocha@tested.co.kr'
        }).expect(200, done);
    });
  });

  describe('GET /user - 회원 정보', function () {
    it('변경한 닉네임이 일치해야 한다.', function (done) {
      // 회원 수정에서 로그아웃 되므로 재로그인
      request.post('/user/login')
        .send({ id: 'mocha', password: 'mocha123' })
        .expect(200, function (err) {
          if (err) {
            return done(err);
          }

          return request.get('/user')
            .expect(200, {
              nickname: '모촤',
              email: 'mocha@tested.co.kr'
            }, done);
        });
    });
  });

  describe('GET /user/logout - 로그아웃', function () {
    it('로그아웃한다.', function (done) {
      request.get('/user/logout').expect(200, done);
    });
  });

  describe.skip('DELETE /user - 회원 탈퇴', function () {
    it('회원을 탈퇴한다.', function (done) {
      request.del('/user').expect(200, done);
    });
  });
});
