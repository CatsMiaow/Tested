'use strict';

describe('Latest API', function () {
  describe('GET /latest/write/:boardId? - 최근 게시글', function () {
    it('전체 게시글 목록을 가져온다.', function (done) {
      request.get('/latest/write')
        .query({ limit: 5 })
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.should.to.be.an('array');
          res.body.should.to.have.deep.property('[0]._id').that.is.a('number');
          res.body.should.to.have.deep.property('[0].board');
          res.body.should.to.have.deep.property('[0].title');
          return done();
        });
    });

    it('mocha 게시글 목록을 가져온다.', function (done) {
      request.get('/latest/write/mocha')
        .query({ limit: 5 })
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.should.to.be.an('array');
          res.body.should.to.have.deep.property('[0]._id').that.is.a('number');
          res.body.should.to.have.deep.property('[0].board', 'mocha');
          res.body.should.to.have.deep.property('[0].commentCount').that.is.a('number');
          return done();
        });
    });
  });

  describe('GET /latest/comment/:boardId? - 최근 댓글', function () {
    it('전체 댓글 목록을 가져온다.', function (done) {
      request.get('/latest/comment')
        .query({ limit: 5 })
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.should.to.be.an('array');
          res.body.should.to.have.deep.property('[0]._id').that.is.a('number');
          res.body.should.to.have.deep.property('[0].write').that.is.a('number');
          res.body.should.to.have.deep.property('[0].board');
          res.body.should.to.have.deep.property('[0].content');
          return done();
        });
    });

    it('mocha 댓글 목록을 가져온다.', function (done) {
      request.get('/latest/comment/mocha')
        .query({ limit: 5 })
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.should.to.be.an('array');
          res.body.should.to.have.deep.property('[0]._id').that.is.a('number');
          res.body.should.to.have.deep.property('[0].write').that.is.a('number');
          res.body.should.to.have.deep.property('[0].board', 'mocha');
          res.body.should.to.have.deep.property('[0].created');
          return done();
        });
    });
  });
});
