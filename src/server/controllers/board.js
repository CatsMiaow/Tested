import _ from 'lodash';
import mongoose from '../config/mongo';
import { wrap, async } from '../modules';

const Board = mongoose.model('Board');
const Write = mongoose.model('Write');
const Comment = mongoose.model('Comment');

// 댓글 정보 추출 및 가공
const refineComment = function* (write, user, limit = 20, page = 1) {
  const doc = yield write.populate({ // 댓글
    path: 'comments',
    select: '-__v -parent -ip',
    options: { skip: (page - 1) * limit, limit, sort: 'parent _id' },
  }).execPopulate();

  if (doc.comments) { // 댓글 재가공, 아이디를 노출하지 않기 위함
    let index = 0;
    for (let comment of doc.comments) {
      if (comment.depth > 2 && comment.reply) { // 2depth 답글이라면
        comment = yield comment.populate('reply', 'name depth').execPopulate();
      }

      comment = comment.toObject(); // 오브젝트로 변환
      comment.isOwner = !!(user && user.id === comment.user); // 작성자인지 확인하고
      comment = _.omit(comment, ['user']); // 유저 필드 삭제

      doc.comments[index] = comment;
      index++;
    }
  }
};

export default {
  // :boardId
  load: wrap(async(function* (req, res, next, id) {
    const board = yield Board.load(id);
    if (!board) {
      throw new Error('NoResult');
    }

    // 글쓰기 권한
    req.isWrite = (req.user && req.user.level >= board.writeLevel);
    // 댓글 권한
    req.isComment = (req.user && req.user.level >= board.commentLevel);
    req.board = board;
    return next();
  })),
  // :writeId
  loadWrite: wrap(async(function* (req, res, next, id) {
    const board = req.board;
    const writeMode = req.params.writeMode || req.body.writeMode;
    let boardLevel = 1;

    switch (req.method) {
      case 'GET': // 쓰기, 읽기
        boardLevel = (writeMode === 'r') ? board.readLevel : board.writeLevel;
        break;
      case 'POST': // 등록
      case 'PUT': // 수정
      case 'DELETE': // 삭제
        boardLevel = (writeMode === 'c') ? board.commentLevel : board.writeLevel;
        break;
      // no default
    }
    // 접근 권한 체크
    if ((!req.user && boardLevel > 1) || (req.user && boardLevel > req.user.level)) {
      const error = new Error();
      error.status = 403;
      throw error;
    }
    // 글쓰기 상태일 때
    if (writeMode === 'w') {
      return next();
    }

    const write = yield Write.load(req.board._id, id, writeMode);
    if (!write) {
      throw new Error('NoResult');
    }
    // 작성자 체크
    req.isOwner = (req.user && req.user.id === write.user);
    req.write = write;
    return next();
  })),
  // :commentId
  loadComment: wrap(async(function* (req, res, next, id) {
    const comment = yield Comment.load(id);
    if (!comment) {
      throw new Error('NoResult');
    }
    // 작성자 체크, Override
    req.isOwner = (req.user && req.user.id === comment.user);
    req.comment = comment;
    return next();
  })),
  /**
   * @api {get} /board/:boardId 게시글 목록
   * @apiName GetBoardWriteList
   * @apiGroup Board_Write
   * @apiDescription 게시판의 게시글 목록을 가져온다.
   * @apiParam {String} boardId 게시판 아이디
   * @apiParam (Query) {Number} page 페이징 번호
   * @apiParam (Query) {String} search 검색어
   * @apiSuccess {String} boardId 게시판 아이디
   * @apiSuccess {Boolean} [isWrite] 게시글 작성 권한 여부
   * @apiSuccess {Number} count 전체 개수
   * @apiSuccess {Number} orderNo 페이지 시작 글 번호
   * @apiSuccess {String} skin 스킨
   * @apiSuccess {Object} page 페이징 데이터
   * @apiSuccess {Number} page.current 현재 페이지
   * @apiSuccess {Number} page.last 마지막 페이지
   * @apiSuccess {Object[]} list 게시글 데이터
   * @apiSuccess {Number} list._id 게시글 아이디
   * @apiSuccess {String} list.name 작성자
   * @apiSuccess {String} list.title 제목
   * @apiSuccess {Number} list.hits 조회수
   * @apiSuccess {Number} list.fileCount 파일 개수
   * @apiSuccess {Number} list.commentCount 댓글 개수
   * @apiSuccess {Date} list.created 등록일
   * @apiSuccess {Date} list.updated 수정일
   * @apiUse DefaultError
   */
  list: wrap(async(function* (req, res) {
    const [param, board] = [req.query, req.board];
    const limit = 20;
    const page = parseInt(param.page, 10) || 1;
    const search = { board: board._id };

    // 리스트 접근 권한 체크
    if ((!req.user && req.board.listLevel > 1)
      || (req.user && req.board.listLevel > req.user.level)) {
      const error = new Error();
      error.status = 403;
      throw error;
    }

    if (param.stx) { // 게시글 검색
      _.extend(search, { $or: [
        { title: new RegExp(param.stx, 'i') },
        { content: new RegExp(param.stx, 'i') }] });
    }

    const list = yield Write.find(search, 'name title fileCount commentCount hits created updated')
      .skip((page - 1) * limit).limit(limit).sort('-created');
    const count = yield Write.count(search);

    res.json({
      boardId: board._id,
      skin: board.skin,
      isWrite: req.isWrite,
      orderNo: count - ((page - 1) * limit),
      page: { current: page, last: Math.ceil(count / limit) },
      list,
      count,
    });
  })),
  /**
   * @api {post} /board/:boardId 게시글 등록
   * @apiName PostBoardWrite
   * @apiGroup Board_Write
   * @apiPermission user
   * @apiDescription 게시판에 게시글을 등록한다.
   * @apiParam {String} boardId 게시판 아이디
   * @apiParam (Body) {Object} data 게시글 데이터
   * @apiParam (Body) {String} data.title 제목
   * @apiParam (Body) {String} data.content 내용
   * @apiParam (Body) {Object[]} [data.files] 파일 데이터
   * @apiParam (Body) {String} data.files.path 업로드 경로
   * @apiParam (Body) {String} data.files.name 업로드 파일명
   * @apiParam (Body) {String} data.files.orig 원본 파일명
   * @apiParam (Body) {String} data.files.type 파일 유형
   * @apiParam (Body) {Number} data.files.size 파일 크기
   * @apiSuccess {Number} writeId 게시글 아이디
   * @apiUse DefaultError
   */
  create: wrap(async(function* (req, res) {
    if (!req.isWrite) {
      const error = new Error();
      error.status = 403;
      throw error;
    }

    const write = new Write(req.body.data);
    write.board = req.board._id;
    write.user = req.user.id;
    write.name = req.user.name;
    write.content = write.content.replace(/="\/data\/temp\//gi, `="/data/file/${req.board._id}/`);
    write.ip = req.ip;

    // 신규 파일
    write.files.forEach((file, index) => {
      write.files[index].user = req.user.id;
      write.files[index].path = `/data/file/${req.board._id}/`;
    });

    const data = yield write.save();

    res.json({ writeId: data._id });
  })),
  /**
   * @api {put} /board/:boardId/:writeId 게시글 수정
   * @apiName PutBoardWrite
   * @apiGroup Board_Write
   * @apiPermission user
   * @apiDescription 게시판의 게시글을 수정한다.
   * @apiParam {String} boardId 게시판 아이디
   * @apiParam {Number} writeId 게시글 아이디
   * @apiParam (Body) {Object} data 게시글 데이터
   * @apiParam (Body) {String} data.title 제목
   * @apiParam (Body) {String} data.content 내용
   * @apiParam (Body) {Object[]} [data.files] 파일 데이터
   * @apiParam (Body) {String} [data.files._id] 파일 아이디
   * @apiParam (Body) {String} data.files.path 업로드 경로
   * @apiParam (Body) {String} data.files.name 업로드 파일명
   * @apiParam (Body) {String} data.files.orig 원본 파일명
   * @apiParam (Body) {String} data.files.type 파일 유형
   * @apiParam (Body) {Number} data.files.size 파일 크기
   * @apiUse DefaultError
   */
  update: wrap(async(function* (req, res) {
    if (!req.isOwner) {
      const error = new Error();
      error.status = 403;
      throw error;
    }

    const oldFiles = req.write.files; // 기존 파일, extend 전에 선언하여 참조 방지
    const write = _.extend(req.write, req.body.data);

    // 기존 파일이 전송된 파일 리스트에 없다면 삭제 처리
    _.filter(oldFiles, file => !_.find(
      write.files, { name: file.name })).forEach(file => file.remove()); // Need _id

    // 신규 파일
    write.files.forEach((file, index) => {
      if (!file.isNew) {
        return index;
      }

      write.files[index].user = req.user.id;
      write.files[index].path = `/data/file/${req.board._id}/`;
      file.save();
    });

    yield write.update({
      title: write.title,
      content: write.content.replace(/="\/data\/temp\//gi, `="/data/file/${req.board._id}/`),
      files: write.files,
      ip: req.ip,
    });

    res.sendStatus(200);
  })),
  /**
   * @api {get} /board/:boardId/:writeMode/:writeId 게시글 정보
   * @apiName GetBoardWrite
   * @apiGroup Board_Write
   * @apiDescription 게시판의 게시글 정보를 가져온다.
   * @apiParam {String} boardId 게시판 아이디
   * @apiParam {String="w","u","r"} writeMode 작성 유형
   * @apiParam {Number} writeId 게시글 아이디
   * @apiSuccess {String} skin 스킨
   * @apiSuccess {Boolean} [isOwner] 작성자 여부
   * @apiSuccess {Boolean} [isWrite] 게시글 작성 권한 여부
   * @apiSuccess {Boolean} [isComment] 댓글 작성 권한 여부
   * @apiSuccess {Object} [coPage] 댓글 페이징 데이터
   * @apiSuccess {Number} coPage.current 현재 페이지
   * @apiSuccess {Number} coPage.last 마지막 페이지
   * @apiSuccess {Object} data 게시글 데이터
   * @apiSuccess {Number} data._id 게시글 아이디
   * @apiSuccess {String} data.board 게시판 아이디
   * @apiSuccess {String} data.name 작성자
   * @apiSuccess {String} data.title 제목
   * @apiSuccess {String} data.content 내용
   * @apiSuccess {Number} data.hits 조회수
   * @apiSuccess {Object[]} data.comments 댓글 데이터
   * @apiSuccess {Number} data.comments._id 댓글 아이디
   * @apiSuccess {String} data.comments.board 게시판 아이디
   * @apiSuccess {Number} data.comments.write 게시글 아이디
   * @apiSuccess {String} data.comments.name 작성자
   * @apiSuccess {String} data.comments.content 내용
   * @apiSuccess {Boolean} [data.comments.isOwner] 작성자 여부
   * @apiSuccess {Boolean} data.comments.isDel 삭제 댓글 여부
   * @apiSuccess {Number} data.comments.depth 댓글 단계
   * @apiSuccess {Number} [data.comments.reply-1] 답글 데이터 / 1depth
   * @apiSuccess {Object} [data.comments.reply-2] 답글의 답글 데이터 / 2depth
   * @apiSuccess {Number} data.comments.reply._id 답글 아이디
   * @apiSuccess {String} data.comments.reply.name 작성자
   * @apiSuccess {Number} data.comments.reply.depth 댓글 단계
   * @apiSuccess {Number} data.comments.replyCount 댓글 답글 개수
   * @apiSuccess {Date} data.comments.created 작성일
   * @apiSuccess {Date} data.comments.updated 수정일
   * @apiSuccess {Object[]} [data.files] 파일 데이터
   * @apiSuccess {String} data.files._id 파일 아이디
   * @apiSuccess {String} data.files.path 업로드 경로
   * @apiSuccess {String} data.files.name 업로드 파일명
   * @apiSuccess {String} data.files.orig 원본 파일명
   * @apiSuccess {Number} data.files.size 파일 크기
   * @apiSuccess {Number} data.fileCount 파일 개수
   * @apiSuccess {Number} data.commentCount 댓글 개수
   * @apiSuccess {Date} data.created 작성일
   * @apiSuccess {Date} data.updated 수정일
   * @apiUse DefaultError
   */
  read: wrap(async(function* (req, res) {
    if (req.params.writeMode === 'u' && !req.isOwner) {
      const error = new Error();
      error.status = 403;
      throw error;
    }

    const [session, board] = [req.session, req.board];
    let write = req.write;

    if (!write) { // 새글쓰기
      return res.json({
        boardId: board._id,
        skin: board.skin,
        data: write });
    }

    // 조회수 +1
    session.viewed = session.viewed || {};

    const viewId = `${board._id}-${write._id}`;
    if (!session.viewed[viewId]) {
      yield write.update({ $inc: { hits: 1 } });
      session.viewed[viewId] = true;
    }

    const limit = 20;
    const lastPage = Math.ceil(write.commentCount / limit);
    const page = parseInt(req.query.page, 10) || lastPage;

    if (write.commentCount > 0) {
      yield* refineComment(write, req.user, limit, page);
    }

    // Mongoose 객체를 Object로, 뷰에 노출하지 않아야될 필드 제거
    write = _.omit(write.toObject(), ['__v', 'user']);

    return res.json({
      skin: board.skin,
      data: write,
      isOwner: req.isOwner,
      isWrite: req.isWrite,
      isComment: req.isComment,
      coPage: { current: page, last: lastPage } });
  })),
  /**
   * @api {delete} /board/:boardId/:writeId 게시글 삭제
   * @apiName DeleteBoardWrite
   * @apiGroup Board_Write
   * @apiPermission user
   * @apiDescription 게시판의 게시글을 삭제한다.
   * @apiParam {String} boardId 게시판 아이디
   * @apiParam {Number} writeId 게시글 아이디
   * @apiUse DefaultError
   */
  remove: wrap(async(function* (req, res) {
    if (!req.isOwner) {
      const error = new Error();
      error.status = 403;
      throw error;
    }

    const write = req.write;
    yield write.remove();

    res.sendStatus(200);
  })),
  /**
   * @api {get} /board/:boardId/r/:writeId/colist 댓글 목록
   * @apiName GetBoardCommentList
   * @apiGroup Board_Comment
   * @apiDescription 게시판 게시글의 댓글 목록을 가져온다.
   * @apiParam {String} boardId 게시판 아이디
   * @apiParam {Number} writeId 게시글 아이디
   * @apiParam (Query) {Number} page 페이징 번호
   * @apiSuccess {Object} page 페이징 데이터
   * @apiSuccess {Number} page.current 현재 페이지
   * @apiSuccess {Number} page.last 마지막 페이지
   * @apiSuccess {Object[]} list 댓글 데이터
   * @apiSuccess {Number} list._id 댓글 아이디
   * @apiSuccess {String} list.board 게시판 아이디
   * @apiSuccess {Number} list.write 게시글 아이디
   * @apiSuccess {String} list.name 작성자
   * @apiSuccess {String} list.content 내용
   * @apiSuccess {Boolean} [list.isOwner] 작성자 여부
   * @apiSuccess {Boolean} list.isDel 삭제 댓글 여부
   * @apiSuccess {Number} list.depth 댓글 단계
   * @apiSuccess {Number} [list.reply-1] 답글 데이터 / 1depth
   * @apiSuccess {Object} [list.reply-2] 답글의 답글 데이터 / 2depth
   * @apiSuccess {Number} list.reply._id 답글 아이디
   * @apiSuccess {String} list.reply.name 작성자
   * @apiSuccess {Number} list.reply.depth 댓글 단계
   * @apiSuccess {Number} list.replyCount 댓글 답글 개수
   * @apiSuccess {Date} list.created 작성일
   * @apiSuccess {Date} list.updated 수정일
   * @apiUse DefaultError
   */
  listComment: wrap(async(function* (req, res) {
    const write = req.write;
    const limit = 20;
    const lastPage = Math.ceil(write.commentCount / limit);
    const page = parseInt(req.query.page, 10) || lastPage;

    if (write.commentCount > 0) {
      yield* refineComment(write, req.user, limit, page);
    }

    res.json({
      list: req.write.comments,
      page: { current: page, last: lastPage } });
  })),
  /**
   * @api {post} /board/:boardId/c/:writeId 댓글 등록
   * @apiName PostBoardComment
   * @apiGroup Board_Comment
   * @apiPermission user
   * @apiDescription 게시판 게시글의 댓글을 등록한다.
   * @apiParam {String} boardId 게시판 아이디
   * @apiParam {Number} writeId 게시글 아이디
   * @apiParam (Body) {String} content 내용
   * @apiParam (Body) {Number} [reply] 답변 댓글 아이디
   * @apiSuccess {Number} _id 댓글 아이디
   * @apiSuccess {String} board 게시판 아이디
   * @apiSuccess {Number} write 게시글 아이디
   * @apiSuccess {String} name 작성자
   * @apiSuccess {String} content 내용
   * @apiSuccess {Boolean} isDel 삭제 댓글 여부
   * @apiSuccess {Object} [reply] 답글 데이터
   * @apiSuccess {Number} reply._id 답글 아이디
   * @apiSuccess {String} reply.name 작성자
   * @apiSuccess {Number} reply.parent 답글의 원글 아이디
   * @apiSuccess {Number} reply.depth 댓글 단계
   * @apiSuccess {Number} replyCount 댓글 답글 개수
   * @apiSuccess {Date} created 작성일
   * @apiSuccess {Date} updated 수정일
   * @apiUse DefaultError
   */
  createComment: wrap(async(function* (req, res) {
    if (!req.isComment) {
      const error = new Error();
      error.status = 403;
      throw error;
    }

    const comment = new Comment(req.body);
    comment.board = req.board._id;
    comment.write = req.write._id;
    comment.user = req.user.id;
    comment.name = req.user.name;
    comment.ip = req.ip;

    let data = yield comment.save();
    data = yield data.populate('reply', 'parent depth name').execPopulate();
    yield data.update({
      parent: data.reply ? data.reply.parent : data._id,
      depth: data.reply ? data.reply.depth + 1 : 1 });

    res.json(_.omit(comment.toObject(), ['__v', 'user', 'parent', 'ip']));
  })),
  /**
   * @api {put} /board/:boardId/c/:writeId/:commentId 댓글 수정
   * @apiName PutBoardComment
   * @apiGroup Board_Comment
   * @apiPermission user
   * @apiDescription 게시판 게시글의 댓글을 수정한다.
   * @apiParam {String} boardId 게시판 아이디
   * @apiParam {Number} writeId 게시글 아이디
   * @apiParam {Number} commentId 댓글 아이디
   * @apiParam (Body) {String} content 내용
   * @apiSuccess {Number} _id 댓글 아이디
   * @apiSuccess {String} content 내용
   * @apiUse DefaultError
   */
  updateComment: wrap(async(function* (req, res) {
    if (!req.isOwner || req.comment.isDel || req.comment.replyCount) {
      const error = new Error();
      error.status = 403;
      throw error;
    }

    const comment = _.extend(req.comment, req.body);
    yield comment.update({ content: comment.content, ip: req.ip });

    res.json({ _id: comment._id, content: comment.content });
  })),
  /**
   * @api {delete} /board/:boardId/c/:writeId/:commentId 댓글 삭제
   * @apiName DeleteBoardComment
   * @apiGroup Board_Comment
   * @apiPermission user
   * @apiDescription 게시판 게시글의 댓글을 삭제한다.
   * @apiParam {String} boardId 게시판 아이디
   * @apiParam {Number} writeId 게시글 아이디
   * @apiParam {Number} commentId 댓글 아이디
   * @apiUse DefaultError
   */
  removeComment: wrap(async(function* (req, res) {
    if (!req.isOwner) {
      const error = new Error();
      error.status = 403;
      throw error;
    }

    const comment = req.comment;
    const count = yield Comment.count({
      board: comment.board, write: comment.write, reply: comment._id });

    if (count > 0) {
      // 삭제 댓글이 답글의 대상이라면
      yield comment.update({
        isDel: true,
        content: '삭제한 댓글입니다.',
        ip: req.ip });
    } else {
      // 답글이 없다면 그냥 삭제
      yield comment.remove();
    }

    res.sendStatus(200);
  })),
};
