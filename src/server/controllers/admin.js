import _ from 'lodash';
import mongoose from '../config/mongo';
import { wrap, async } from '../modules';

const User = mongoose.model('User');
const Board = mongoose.model('Board');

export default {
  // 게시판
  board: {
    // :id
    load: wrap(async(function* (req, res, next) {
      // 등록일 때는 아이디를 조회하지 않음
      if (req.method === 'POST' || req.params.id === 'write') {
        req.board = { isNew: true };
        return next();
      }

      const board = yield Board.load(req.params.id);
      if (!board) {
        throw new Error('NoResult');
      }

      req.board = board;
      return next();
    })),
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
    list: wrap(async(function* (req, res) {
      const param = req.query;
      const limit = 20;
      const page = parseInt(param.page, 10) || 1;
      // const search = param.stx;

      const list = yield Board.find({}, '+created +updated')
        .skip((page - 1) * limit).limit(limit).sort('-created');
      const count = yield Board.count();

      res.json({
        orderNo: count - ((page - 1) * limit),
        page: { current: page, last: Math.ceil(count / limit) },
        list,
        count,
      });
    })),
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
     * @apiError DuplicatedId 중복된 아이디
     */
    create: wrap(async(function* (req, res) {
      req.checkBody('_id').isAlphanumeric();
      req.checkBody('title').notEmpty();

      if (req.validationErrors()) {
        throw new Error('RequiredParameter');
      }

      const board = new Board(req.body);

      const count = yield Board.is(board._id);
      if (count > 0) {
        throw new Error('DuplicatedId');
      }

      const data = yield board.save();

      res.json({ id: data._id });
    })),
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
    read(req, res) {
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
    update: wrap(async(function* (req, res) {
      if (req.board._id !== req.body._id) {
        throw new Error('BadRequest');
      }

      const board = _.extend(req.board, req.body);

      yield board.update({
        title: board.title,
        skin: board.skin,
        listLevel: board.listLevel,
        readLevel: board.readLevel,
        writeLevel: board.writeLevel,
        commentLevel: board.commentLevel,
      });

      res.json({ id: board._id });
    })),
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
    remove(req, res) {
      res.sendStatus(403);
    },
  },
  // 회원
  user: {
    // :id
    load: wrap(async(function* (req, res, next) {
      const user = yield User.get(req.params.id, '-password');
      if (!user) {
        throw new Error('NoResult');
      }

      req.data = user;
      return next();
    })),
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
    list: wrap(async(function* (req, res) {
      const param = req.query;
      const limit = 20;
      const page = parseInt(param.page, 10) || 1;
      // const search = param.stx;

      const list = yield User.find({}, '-password')
        .skip((page - 1) * limit).limit(limit).sort('-created');
      const count = yield User.count();

      res.json({
        orderNo: count - ((page - 1) * limit),
        page: { current: page, last: Math.ceil(count / limit) },
        list,
        count,
      });
    })),
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
    read(req, res) {
      res.json(req.data);
    },
  },
};
