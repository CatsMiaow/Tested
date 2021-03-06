import latest from '../controllers/latest';

export default router => {
  router.get('/v/latest/write/:boardId?', latest.write); // 게시글 리스트
  router.get('/v/latest/comment/:boardId?', latest.comment); // 댓글 리스트
};
