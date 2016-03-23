'use strict';

describe('Upload API', function () {
  var image = null;

  describe('POST /upload/image - 이미지 업로드', function () {
    it('테스트 이미지를 업로드한다.', function (done) {
      request.post('/upload/image')
        .attach('file', 'test/bootstrap/test.jpg')
        .expect(200, function (err, res) {
          if (err) {
            return done(err);
          }

          res.body.should.to.have.deep.property('path');
          res.body.should.to.have.deep.property('name');

          // 이미지 삭제를 위한
          image = res.body.path + res.body.name;
          return done();
        });
    });
  });

  describe('POST /upload/delete - 이미지 삭제', function () {
    it('테스트 이미지를 삭제한다.', function (done) {
      request.post('/upload/delete')
        .send({ file: image })
        .expect(200, done);
    });
  });
});
