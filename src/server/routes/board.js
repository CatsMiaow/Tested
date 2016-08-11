import board from '../controllers/board';

export default (router, pass) => {
  router.route('/v/board/:boardId')
    .get(board.list) // 게시글 리스트
    .post(pass.authenticated, board.create); // 게시글 작성

  router.route('/v/board/:boardId/:writeMode/:writeId')
    .get(board.read) // 게시글 읽기
    .post(pass.authenticated, board.createComment); // 댓글 작성

  router.route('/v/board/:boardId/:writeId')
    .put(pass.authenticated, board.update) // 게시글 수정
    .delete(pass.authenticated, board.remove); // 게시글 삭제

  router.get('/v/board/:boardId/:writeMode/:writeId/colist', board.listComment); // 댓글 리스트
  router.route('/v/board/:boardId/:writeMode/:writeId/:commentId')
    .put(pass.authenticated, board.updateComment) // 댓글 수정
    .delete(pass.authenticated, board.removeComment); // 댓글 삭제

  // :boardId 값이 있을 때 board.load 컨트롤러를 탄다.
  // router.param의 파라미터는 모든 라우터에 공통으로 작동한다. ex) admin/board/:boardId
  router.param('boardId', board.load);
  router.param('writeId', board.loadWrite);
  router.param('commentId', board.loadComment);
};
