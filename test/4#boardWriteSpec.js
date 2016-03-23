'use strict';

describe('Board-Write API', function () {
  var writeId;

  describe('POST /board/:boardId - 게시글 등록', function () {
    var image = null;

    before('게시글에 등록할 이미지 업로드', function (done) {
      request.post('/upload/image')
      .attach('file', 'test/bootstrap/test.jpg')
      .expect(function (res) {
        image = res.body;
      }).end(done);
    });

    it('게시글에 이미지를 첨부하여 등록한다.', function (done) {
      request.post('/board/mocha')
        .send({
          data: {
            title: '테스트 제목입니다.',
            content: '테스트 내용입니다.',
            files: [image]
          }
        }).expect(200, function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.should.to.have.property('writeId').that.is.a('number');

          writeId = res.body.writeId;
          return done();
        });
    });
  });

  describe('GET /board/:boardId - 게시글 목록', function () {
    it('게시글 목록을 가져온다.', function (done) {
      request.get('/board/mocha')
        .query({ page: 1, search: '테스트' })
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.should.to.have.property('isWrite').that.is.true;
          res.body.should.to.have.property('count');
          res.body.should.to.have.deep.property('page.current', 1);
          res.body.should.to.have.deep.property('list[0]._id', writeId);
          res.body.should.to.have.deep.property('list[0].created');
          return done();
        });
    });
  });

  describe('PUT /board/:boardId/:writeId - 게시글 수정', function () {
    it('게시글의 이미지를 삭제하고 수정한다.', function (done) {
      request.put('/board/mocha/' + writeId)
        .send({
          data: {
            title: '테스트 수정 제목입니다.',
            content: '테스트 수정 내용입니다.',
            files: [] // 이미지 삭제
          }
        }).expect(200, done);
    });
  });

  describe('GET /board/:boardId/:writeMode/:writeId - 게시글 정보', function () {
    it('게시글 정보를 가져온다.', function (done) {
      request.get('/board/mocha/r/' + writeId)
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.should.to.have.property('isComment').that.is.true;
          res.body.should.to.have.deep.property('data._id', writeId);
          res.body.should.to.have.deep.property('data.title').that.is.string('테스트');
          res.body.should.to.have.deep.property('data.comments').that.is.empty;
          return done();
        });
    });

    it('게시글 작성 시의 정보를 가져온다.', function (done) {
      request.get('/board/mocha/w/' + writeId).expect(200, {
        boardId: 'mocha', skin: 'basic'
      }, done);
    });

    it('게시글 수정 시의 정보를 가져온다.', function (done) {
      request.get('/board/mocha/u/' + writeId)
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.should.to.have.property('isWrite').that.is.true;
          res.body.should.to.have.deep.property('data._id', writeId);
          res.body.should.to.have.deep.property('data.title').that.is.string('테스트');
          res.body.should.to.have.deep.property('data.files').that.is.empty;
          return done();
        });
    });
  });

  describe('DELETE /board/:boardId/:writeId - 게시글 삭제', function () {
    it('게시글을 삭제한다.', function (done) {
      request.del('/board/mocha/' + writeId).expect(200, done);
    });
  });
});
