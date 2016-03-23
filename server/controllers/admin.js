'use strict';

var mongoose = require('mongoose');
var _ = require('lodash');
var User = mongoose.model('User');
var Board = mongoose.model('Board');

var adminControllers = {
  // 게시판
  board: {
    // :id
    load: function (req, res, next) {
      // 등록일 때
      if (req.method === 'POST' || req.params.id === 'write') {
        req.board = { isNew: true };
        return next();
      }

      return Board.load(req.params.id, function (err, board) {
        var error;

        if (err) {
          return next(err);
        } else if (!board) {
          error = new Error('일치하는 정보가 없습니다.');
          error.status = 400;
          return next(error);
        }

        req.board = board;
        return next();
      });
    },
    /**
     * @api {get} /admin/board 게시판 목록
     * @apiName GetAdminBoardList
     * @apiGroup Admin
     * @apiPermission admin
     * @apiDescription 게시판 목록을 출력한다.
     * @apiParam (Query) {Number} page 페이징 번호
     * @apiSuccess {Number} count 전체 개수
     * @apiSuccess {Number} orderNo 페이지 시작 글 번호
     * @apiSuccess {Object} page 페이징 데이터
     * @apiSuccess {Number} page.current 현재 페이지
     * @apiSuccess {Number} page.last 마지막 페이지
     * @apiSuccess {Object[]} list 게시판 데이터
     * @apiSuccess {String} list._id 게시판 아이디
     * @apiSuccess {String} list.title 타이틀
     * @apiSuccess {String} list.skin 스킨
     * @apiSuccess {Number} list.listLevel 목록 레벨
     * @apiSuccess {Number} list.readLevel 읽기 레벨
     * @apiSuccess {Number} list.writeLevel 작성 레벨
     * @apiSuccess {Number} list.commentLevel 댓글 레벨
     * @apiSuccess {Number} list.writeCount 게시글 개수
     * @apiSuccess {Number} list.commentCount 댓글 개수
     * @apiSuccess {Date} list.created 등록일
     * @apiSuccess {Date} list.updated 수정일
     * @apiUse DefaultError
     */
    list: function (req, res) {
      var param = req.query;
      var list = [];
      var limit = 20;
      var page = parseInt(param.page, 10) || 1;
      // var search = param.search;

      Board.find({}, '+created +updated')
        .skip((page - 1) * limit).limit(limit).sort('-created').exec()
        .then(function (result) {
          list = result;

          return Board.count().exec();
        }).then(function (count) {
          res.json({
            orderNo: count - (page - 1) * limit,
            page: { current: page, last: Math.ceil(count / limit) },
            count: count,
            list: list
          });
        }).then(null, function (err) {
          res.status(err.code ? 500 : 400).send(err.message);
        });
    },
    /**
     * @api {post} /admin/board/write 게시판 등록
     * @apiName PostAdminBoard
     * @apiGroup Admin
     * @apiPermission admin
     * @apiDescription 게시판을 등록한다.
     * @apiParam (Body) {String{4..15}} _id 영문 소문자와 숫자로 조합된 아이디
     * @apiParam (Body) {String} title 타이틀
     * @apiParam (Body) {String} [skin] 스킨
     * @apiParam (Body) {Number} [listLevel] 목록 레벨
     * @apiParam (Body) {Number} [readLevel] 읽기 레벨
     * @apiParam (Body) {Number} [writeLevel] 작성 레벨
     * @apiParam (Body) {Number} [commentLevel] 댓글 레벨
     * @apiSuccess {String} id 게시판 아이디
     * @apiUse DefaultError
     */
    create: function (req, res) {
      var board;

      req.checkBody('_id').isAlphanumeric();
      req.checkBody('title').notEmpty();

      if (req.validationErrors()) {
        return res.status(400).json({
          message: 'Required Parameter' });
      }

      board = new Board(req.body);

      return Board.is(board._id).then(function (count) {
        if (count > 0) {
          throw new Error('_id');
        }

        return board.save();
      }).then(function (data) { // , affected
        res.json({
          id: data._id });
      }).then(null, function (err) {
        res.status(err.code ? 500 : 409).send(err.message);
      });
    },
    /**
     * @api {get} /admin/board/:id 게시판 정보
     * @apiName GetAdminBoard
     * @apiGroup Admin
     * @apiPermission admin
     * @apiDescription 게시판 정보를 불러온다.
     * @apiParam {String} id 게시판 아이디
     * @apiSuccess {String} _id 게시판 아이디
     * @apiSuccess {String} title 타이틀
     * @apiSuccess {String} skin 스킨
     * @apiSuccess {Number} listLevel 목록 레벨
     * @apiSuccess {Number} readLevel 읽기 레벨
     * @apiSuccess {Number} writeLevel 작성 레벨
     * @apiSuccess {Number} commentLevel 댓글 레벨
     * @apiSuccess {Number} writeCount 게시글 개수
     * @apiSuccess {Number} commentCount 댓글 개수
     * @apiUse DefaultError
     */
    read: function (req, res) {
      res.json(req.board);
    },
    /**
     * @api {put} /admin/board/:id 게시판 수정
     * @apiName PutAdminBoard
     * @apiGroup Admin
     * @apiPermission admin
     * @apiDescription 게시판 정보를 수정한다.
     * @apiParam {String} id 게시판 아이디
     * @apiParam (Body) {String} _id 게시판 아이디
     * @apiParam (Body) {String} title 타이틀
     * @apiParam (Body) {String} skin 스킨
     * @apiParam (Body) {Number} listLevel 목록 레벨
     * @apiParam (Body) {Number} readLevel 읽기 레벨
     * @apiParam (Body) {Number} writeLevel 작성 레벨
     * @apiParam (Body) {Number} commentLevel 댓글 레벨
     * @apiSuccess {String} id 게시판 아이디
     * @apiUse DefaultError
     */
    update: function (req, res) {
      var board;

      if (req.board._id !== req.body._id) {
        return res.sendStatus(400);
      }

      board = _.extend(req.board, req.body);
      return board.update({
        title: board.title,
        skin: board.skin,
        listLevel: board.listLevel,
        readLevel: board.readLevel,
        writeLevel: board.writeLevel,
        commentLevel: board.commentLevel
      }, function (err) { // , result
        if (err) {
          return res.status(500).send(err);
        }

        return res.json({
          id: board._id });
      });
    },
    /**
     * @apiIgnore 게시판 삭제는 미구현
     * @api {delete} /admin/board/:id 게시판 삭제
     * @apiName DeleteAdminBoard
     * @apiGroup Admin
     * @apiPermission admin
     * @apiDescription 게시판을 삭제한다.
     * @apiParam {String} id 게시판 아이디
     * @apiUse DefaultError
     */
    remove: function (req, res) {
      res.sendStatus(403);
    }
  },
  // 회원
  user: {
    // :id
    load: function (req, res, next) {
      User.get(req.params.id, '-password').then(function (user) {
        if (!user) {
          throw new Error('일치하는 정보가 없습니다.');
        }

        req.data = user;
        next();
      }).then(null, function (err) {
        res.status(err.code ? 500 : 400).send(err.message);
        // next('route'); // 404
        // next(err); // 500
      });
    },
    /**
     * @api {get} /admin/user 회원 목록
     * @apiName GetAdminUserList
     * @apiGroup Admin
     * @apiPermission admin
     * @apiDescription 회원 목록을 출력한다.
     * @apiParam (Query) {Number} page 페이징 번호
     * @apiSuccess {Number} count 전체 개수
     * @apiSuccess {Number} orderNo 페이지 시작 글 번호
     * @apiSuccess {Object} page 페이징 데이터
     * @apiSuccess {Number} page.current 현재 페이지
     * @apiSuccess {Number} page.last 마지막 페이지
     * @apiSuccess {Object[]} list 회원 데이터
     * @apiSuccess {String} list._id 회원 아이디
     * @apiSuccess {Number} list.level 레벨
     * @apiSuccess {String} list.nickname 닉네임
     * @apiSuccess {String} list.email 이메일
     * @apiSuccess {String} list.ip 가입 아이피
     * @apiSuccess {Date} [list.logined] 로그인 날짜
     * @apiSuccess {String} [list.loginip] 로그인 아이피
     * @apiSuccess {Date} list.created 가입일
     * @apiSuccess {Date} list.updated 정보 수정일
     * @apiUse DefaultError
     */
    list: function (req, res) {
      var param = req.query;
      var list = [];
      var limit = 20;
      var page = parseInt(param.page, 10) || 1;
      // var search = param.search;

      User.find({}, '-password')
        .skip((page - 1) * limit).limit(limit).sort('-created').exec()
        .then(function (result) {
          list = result;

          return User.count().exec();
        }).then(function (count) {
          res.json({
            orderNo: count - (page - 1) * limit,
            page: { current: page, last: Math.ceil(count / limit) },
            count: count,
            list: list
          });
        }).then(null, function (err) {
          res.status(err.code ? 500 : 400).send(err.message);
        });
    },
    /**
     * @api {get} /admin/user/:id 회원 정보
     * @apiName GetAdminUser
     * @apiGroup Admin
     * @apiPermission admin
     * @apiDescription 회원 정보를 가져온다.
     * @apiParam {String} id 회원 아이디
     * @apiSuccess {String} _id 회원 아이디
     * @apiSuccess {Number} level 레벨
     * @apiSuccess {String} nickname 닉네임
     * @apiSuccess {String} email 이메일
     * @apiSuccess {String} ip 가입 아이피
     * @apiSuccess {Date} [logined] 로그인 날짜
     * @apiSuccess {String} [loginip] 로그인 아이피
     * @apiSuccess {Date} created 가입일
     * @apiSuccess {Date} updated 정보 수정일
     * @apiUse DefaultError
     */
    read: function (req, res) {
      res.json(req.data);
    }
  }
};


module.exports = adminControllers;
