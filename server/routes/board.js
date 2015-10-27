'use strict';

var board = require('../controllers/board');

module.exports = function(router, pass) {
    router.get('/v/board/:boardId', board.list); // 게시글 리스트
    router.get('/v/board/:boardId/:writeMode/:writeId/colist', board.listComment); // 댓글 리스트

    router.get('/v/board/:boardId/:writeMode/:writeId', board.read); // 게시글 읽기
    router.post('/v/board/:boardId', pass.authenticated, board.create); // 게시글 작성
    router.put('/v/board/:boardId/:writeId', pass.authenticated, board.update); // 게시글 수정
    router.delete('/v/board/:boardId/:writeId', pass.authenticated, board.remove); // 게시글 삭제

    router.post('/v/board/:boardId/:writeMode/:writeId', board.createComment); // 댓글 작성
    router.put('/v/board/:boardId/:writeMode/:writeId/:commentId', board.updateComment); // 댓글 수정
    router.delete('/v/board/:boardId/:writeMode/:writeId/:commentId', board.removeComment); // 댓글 삭제
    
    // :boardId 값이 있을 때 board.load 컨트롤러를 탄다.
    router.param('boardId', board.load);
    router.param('writeId', board.loadWrite);
    router.param('commentId', board.loadComment);
};
