'use strict';

var latest = require('../controllers/latest');

module.exports = function(router, pass) {
    router.get('/v/latest/write/:boardId?', latest.write); // 게시글 리스트
    router.get('/v/latest/comment/:boardId?', latest.comment); // 댓글 리스트
};
