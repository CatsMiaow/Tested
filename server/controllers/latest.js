'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');
var Board = mongoose.model('Board');
var Write = mongoose.model('Write');
var Comment = mongoose.model('Comment');

var _boardList = function (user, board) {
  var search = {
    listLevel: { $lte: user ? user.level : 1 } };

  if (board) {
    search._id = board;
  }

  return Board.find(search, '_id').exec();
};

var latestControllers = {
  /**
   * @api {get} /latest/write/:boardId? 최근 게시글
   * @apiName GetLatestWrite
   * @apiGroup Latest
   * @apiDescription 최근 게시글 목록을 가져온다.
   * @apiParam {String} [boardId] 게시판 아이디
   * @apiParam (Query) {Number} limit 출력 제한 개수
   * @apiSuccess {Object[]} - 게시글 목록
   * @apiSuccess {Number} -._id 게시글 아이디
   * @apiSuccess {String} -.board 게시판 아이디
   * @apiSuccess {String} -.title 제목
   * @apiSuccess {Date} -.created 작성일
   * @apiSuccess {Number} -.commentCount 댓글 개수
   * @apiUse DefaultError
   */
  write: function (req, res) {
    var query = req.query;
    var param = req.params;

    req.checkQuery('limit').isInt();
    if (req.validationErrors()) {
      return res.status(400).json({
        message: 'Required Parameter' });
    }

    return _boardList(req.user, param.boardId).then(function (boards) {
      return Write.find({
        board: { $in: _.map(boards, '_id') }
      }, '_id board title commentCount created').sort('-created').limit(query.limit).exec();
    }).then(function (result) {
      res.json(result);
    }).then(null, function (err) {
      res.status(err.code ? 500 : 400).send(err.message);
    });
  },
  /**
   * @api {get} /latest/comment/:boardId? 최근 댓글
   * @apiName GetLatestComment
   * @apiGroup Latest
   * @apiDescription 최근 댓글 목록을 가져온다.
   * @apiParam {String} [boardId] 게시판 아이디
   * @apiParam (Query) {Number} limit 출력 제한 개수
   * @apiSuccess {Object[]} - 댓글 목록
   * @apiSuccess {Number} -._id 댓글 아이디
   * @apiSuccess {Number} -.write 게시글 아이디
   * @apiSuccess {String} -.board 게시판 아이디
   * @apiSuccess {String} -.content 내용
   * @apiSuccess {Date} -.created 작성일
   * @apiUse DefaultError
   */
  comment: function (req, res) {
    var query = req.query;
    var param = req.params;

    req.checkQuery('limit').isInt();
    if (req.validationErrors()) {
      return res.status(400).json({
        message: 'Required Parameter' });
    }

    return _boardList(req.user, param.boardId).then(function (boards) {
      return Comment.find({
        board: { $in: _.map(boards, '_id') },
        isDel: false
      }, '_id board write content created').sort('-created').limit(query.limit).exec();
    }).then(function (result) {
      res.json(result);
    }).then(null, function (err) {
      res.status(err.code ? 500 : 400).send(err.message);
    });
  }
};


module.exports = latestControllers;
