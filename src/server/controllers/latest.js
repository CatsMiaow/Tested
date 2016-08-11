import _ from 'lodash';
import mongoose from '../config/mongo';
import { wrap, async } from '../modules';

const Board = mongoose.model('Board');
const Write = mongoose.model('Write');
const Comment = mongoose.model('Comment');

export default {
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
  write: wrap(async(function* (req, res) {
    req.checkQuery('limit').isInt();
    if (req.validationErrors()) {
      throw new Error('RequiredParameter');
    }

    const [query, param] = [req.query, req.params];
    const search = {
      listLevel: { $lte: req.user ? req.user.level : 1 } };

    if (param.boardId) {
      search._id = param.boardId;
    }

    const boards = yield Board.find(search, '_id');
    const list = yield Write.find({
      board: { $in: _.map(boards, '_id') },
    }, '_id board title commentCount created').sort('-created').limit(query.limit);

    res.json(list);
  })),
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
  comment: wrap(async(function* (req, res) {
    req.checkQuery('limit').isInt();
    if (req.validationErrors()) {
      throw new Error('RequiredParameter');
    }

    const [query, param] = [req.query, req.params];
    const search = {
      listLevel: { $lte: req.user ? req.user.level : 1 } };

    if (param.boardId) {
      search._id = param.boardId;
    }

    const boards = yield Board.find(search, '_id');
    const list = yield Comment.find({
      board: { $in: _.map(boards, '_id') }, isDel: false,
    }, '_id board write content created').sort('-created').limit(query.limit);

    res.json(list);
  })),
};
