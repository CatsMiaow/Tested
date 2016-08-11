describe('Admin API', () => {
  before('관리자 아이디로 로그인', done => {
    request.post('/user/login')
      .send({ id: 'admin', password: 'password' })
      .expect(200, done);
  });

  describe('GET /admin/user - 회원 목록', () => {
    it('회원 목록를 가져온다.', done => {
      request.get('/admin/user')
        .query({ page: 1 })
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          res.body.should.property('count');
          res.body.should.deep.property('page.current', 1);
          res.body.should.deep.property('list[0]._id', 'mocha');
          res.body.should.deep.property('list[0].created');
          return done();
        });
    });
  });

  describe('GET /admin/user/:id - 회원 정보', () => {
    it('mocha 아이디의 회원 정보를 가져온다.', done => {
      request.get('/admin/user/mocha')
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          res.body.should.property('_id', 'mocha');
          res.body.should.property('created');
          return done();
        });
    });
  });

  describe('POST /admin/board/write - 게시판 등록', () => {
    it('mocha 게시판을 생성한다.', done => {
      request.post('/admin/board/write')
        .send({
          _id: 'mocha',
          title: 'mocha',
        }).expect(200, { id: 'mocha' }, done);
    });
  });

  describe('GET /admin/board - 게시판 목록', () => {
    it('게시판 목록을 가져온다.', done => {
      request.get('/admin/board')
        .query({ page: 1 })
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          res.body.should.property('count');
          res.body.should.deep.property('page.current', 1);
          res.body.should.deep.property('list[0]._id', 'mocha');
          res.body.should.deep.property('list[0].created');
          return done();
        });
    });
  });

  describe('PUT /admin/board/:id - 게시판 수정', () => {
    it('게시판 정보를 수정한다.', done => {
      request.put('/admin/board/mocha')
        .send({
          _id: 'mocha',
          title: '모촤',
          skin: 'basic',
          listLevel: 2,
          readLevel: 2,
          writeLevel: 2,
          commentLevel: 2,
        }).expect(200, { id: 'mocha' }, done);
    });
  });

  describe('GET /admin/board/:id - 게시판 정보', () => {
    it('변경한 정보가 일치해야 한다.', done => {
      request.get('/admin/board/mocha')
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          res.body.should.property('title', '모촤');
          res.body.should.property('listLevel', 2);
          return done();
        });
    });
  });

  describe.skip('DELETE /admin/board/:id - 게시판 삭제', () => {
    it('mocha 게시판을 삭제한다.', done => {
      request.del('/admin/board/mocha').expect(200, done);
    });
  });
});
