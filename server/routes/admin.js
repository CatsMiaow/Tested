'use strict';

var admin = require('../controllers/admin');

module.exports = function (router, pass) {
  // 관리자 접근 제한
  router.all('/v/admin/*', pass.ensureAdmin);

  /* <게시판> */
  router.route('/v/admin/board')
    .get(admin.board.list); // 리스트

  router.route('/v/admin/board/:id')
    .all(admin.board.load) // :id check
    .post(admin.board.create) // 등록
    .get(admin.board.read) // 읽기
    .put(admin.board.update) // 수정
    .delete(admin.board.remove); // 삭제
  /* </게시판> */

  /* <사용자> */
  router.get('/v/admin/user', admin.user.list); // 리스트
  router.route('/v/admin/user/:id')
    .all(admin.user.load) // :id check
    .get(admin.user.read); // 읽기
    // .put(admin.user.update) // 수정
    // .delete(admin.user.remove); // 삭제
  /* </사용자> */
};
