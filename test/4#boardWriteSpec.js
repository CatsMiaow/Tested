describe('Board-Write API', () => {
  let writeId;

  describe('POST /board/:boardId - 게시글 등록', () => {
    let image = null;

    before('게시글에 등록할 이미지 업로드', done => {
      request.post('/upload/image')
      .attach('file', 'test/bootstrap/test.jpg')
      .expect(res => {
        image = res.body;
      }).end(done);
    });

    it('게시글에 이미지를 첨부하여 등록한다.', done => {
      request.post('/board/mocha')
        .send({
          data: {
            title: '테스트 제목입니다.',
            content: '테스트 내용입니다.',
            files: [image],
          },
        }).expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          res.body.should.property('writeId').a('number');

          writeId = res.body.writeId;
          return done();
        });
    });
  });

  describe('GET /board/:boardId - 게시글 목록', () => {
    it('게시글 목록을 가져온다.', done => {
      request.get('/board/mocha')
        .query({ page: 1, search: '테스트' })
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          res.body.should.property('isWrite').true;
          res.body.should.property('count');
          res.body.should.deep.property('page.current', 1);
          res.body.should.deep.property('list[0]._id', writeId);
          res.body.should.deep.property('list[0].created');
          return done();
        });
    });
  });

  describe('PUT /board/:boardId/:writeId - 게시글 수정', () => {
    it('게시글의 이미지를 삭제하고 수정한다.', done => {
      request.put(`/board/mocha/${writeId}`)
        .send({
          data: {
            title: '테스트 수정 제목입니다.',
            content: '테스트 수정 내용입니다.',
            files: [], // 이미지 삭제
          },
        }).expect(200, done);
    });
  });

  describe('GET /board/:boardId/:writeMode/:writeId - 게시글 정보', () => {
    it('게시글 정보를 가져온다.', done => {
      request.get(`/board/mocha/r/${writeId}`)
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          res.body.should.property('isComment').true;
          res.body.should.deep.property('data._id', writeId);
          res.body.should.deep.property('data.title').string('테스트');
          res.body.should.deep.property('data.comments').empty;
          return done();
        });
    });

    it('게시글 작성 시의 정보를 가져온다.', done => {
      request.get(`/board/mocha/w/${writeId}`).expect(200, {
        boardId: 'mocha', skin: 'basic',
      }, done);
    });

    it('게시글 수정 시의 정보를 가져온다.', done => {
      request.get(`/board/mocha/u/${writeId}`)
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          res.body.should.property('isWrite').true;
          res.body.should.deep.property('data._id', writeId);
          res.body.should.deep.property('data.title').string('테스트');
          res.body.should.deep.property('data.files').empty;
          return done();
        });
    });
  });

  describe('DELETE /board/:boardId/:writeId - 게시글 삭제', () => {
    it('게시글을 삭제한다.', done => {
      request.del(`/board/mocha/${writeId}`).expect(200, done);
    });
  });
});
