describe('Upload API', () => {
  let image = null;

  describe('POST /upload/image - 이미지 업로드', () => {
    it('테스트 이미지를 업로드한다.', done => {
      request.post('/upload/image')
        .attach('file', 'test/bootstrap/test.jpg')
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          res.body.should.deep.property('path');
          res.body.should.deep.property('name');

          // 이미지 삭제를 위한
          image = res.body.path + res.body.name;
          return done();
        });
    });
  });

  describe('POST /upload/delete - 이미지 삭제', () => {
    it('테스트 이미지를 삭제한다.', done => {
      request.post('/upload/delete')
        .send({ file: image })
        .expect(200, done);
    });
  });
});
