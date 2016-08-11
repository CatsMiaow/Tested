describe('Board-Comment API', () => {
  let writeId;
  let commentId;
  let commentReplyId;

  before('댓글을 작성할 게시글 등록', done => {
    request.post('/board/mocha')
      .send({
        data: { title: '테스트', content: '테스트' },
      }).expect(200, (err, res) => {
        if (err) {
          return done(err);
        }

        res.body.should.property('writeId').a('number');

        writeId = res.body.writeId;
        return done();
      });
  });

  describe('POST /board/:boardId/c/:writeId - 댓글 등록', () => {
    it('댓글을 등록한다.', done => {
      request.post(`/board/mocha/c/${writeId}`)
        .send({ content: '테스트 댓글' })
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          res.body.should.property('_id').a('number');
          res.body.should.property('content', '테스트 댓글');
          res.body.should.property('created');

          commentId = res.body._id;
          return done();
        });
    });

    it('등록된 댓글에 답글을 등록한다.', done => {
      request.post(`/board/mocha/c/${writeId}`)
        .send({
          content: '테스트 댓글의 답글',
          reply: commentId,
        })
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          res.body.should.property('_id').a('number');
          res.body.should.deep.property('reply._id', commentId);
          res.body.should.deep.property('reply.parent', commentId);
          res.body.should.property('created');

          commentReplyId = res.body._id;
          return done();
        });
    });
  });

  describe('PUT /board/:boardId/c/:writeId/:commentId - 댓글 수정', () => {
    it('답글이 달린 댓글은 수정할 수 없다. ', done => {
      request.put(`/board/mocha/c/${writeId}/${commentId}`)
        .send({ content: '수정하고 싶습니다.' })
        .expect(403, done);
    });

    it('댓글을 수정한다.', done => {
      request.put(`/board/mocha/c/${writeId}/${commentReplyId}`)
        .send({ content: '수정한 댓글' })
        .expect(200, { _id: commentReplyId, content: '수정한 댓글' }, done);
    });
  });

  describe('DELETE /board/:boardId/c/:writeId/:commentId - 댓글 삭제', () => {
    it('댓글을 삭제한다.', done => {
      request.del(`/board/mocha/c/${writeId}/${commentId}`).expect(200, done);
    });
  });

  describe('GET /board/:boardId/r/:writeId/colist - 댓글 목록', () => {
    it('댓글 목록을 가져온다.', done => {
      request.get(`/board/mocha/r/${writeId}/colist`)
        .query({ page: 1 })
        .expect(200, (err, res) => {
          if (err) {
            return done(err);
          }

          res.body.should.deep.property('page.current', 1);
          res.body.should.deep.property('list[0]._id', commentId);
          res.body.should.deep.property('list[0].isDel').true;
          res.body.should.deep.property('list[1].depth', 2);
          res.body.should.deep.property('list[1].reply').a('number');
          return done();
        });
    });
  });
});
