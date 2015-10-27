'use strict';

var mongoose = require('mongoose')
  , Q       = require('q')
  , _       = require('underscore')
  , Board   = mongoose.model('Board')
  , Write   = mongoose.model('Write')
  , Comment = mongoose.model('Comment');

// 댓글 정보 개별 재가공
var _refineCommentData = function(comment, user) {
    var comment = comment.toObject(); // 오브젝트로
        comment.isOwner = user && user.id == comment.user; // user 사용하고
        comment = _.omit(comment, ['user']); // 지운다

    return comment;
};

// 댓글 정보 추출
var _refineComment = function(write, user, param, callback) {
    if (write.commentCount < 1) { return callback(); }

    var limit = 20
      , lastPage = Math.ceil(write.commentCount / limit)
      , page = param.page || lastPage;

    write.populate({ // 댓글
        path: 'comments', select: '-__v -parent -ip',
        options: {  
            skip : (page - 1) * limit,
            limit: limit,
            sort : 'parent _id'
        }
    }, function(err, write) {
        if (err) { return callback(err); }

        var replyExec = []; // 답글 정보
        if (write.comments) { // 댓글 재가공, 아이디를 노출하지 않기 위함
            write.comments.forEach(function(comment, index) {
                if (comment.depth > 2 && comment.reply) { // 2depth 답글이라면
                    replyExec[index] = comment.populate('reply', 'name depth').execPopulate();
                    return index;
                }

                this[index] = _refineCommentData(comment, user);
            }, write.comments);
        }

        Q.all(replyExec).then(function(comments) {
            if (!_.isEmpty(comments)) {
                comments.forEach(function(comment, index) {
                    this[index] = _refineCommentData(comment, user);;
                }, write.comments);
            }

            callback(null, { current: page, last: lastPage });
        });
    });
};

var boardControllers = {
    // :boardId
    load: function(req, res, next, id) {
        Board.load(id, function(err, board) {
            if (err) { return next(err); }
            else if (!board) {
                var error = new Error('일치하는 정보가 없습니다.');
                    error.status = 400;
                return next(error);
            }

            // 글쓰기 권한
            req.isWrite = (req.user && req.user.level >= board.writeLevel);
            // 댓글 권한
            req.isComment = (req.user && req.user.level >= board.commentLevel);
            req.board = board;
            next();
        });
    },
    // :writeId
    loadWrite: function(req, res, next, id) {
        var board = req.board
          , boardLevel = 1
          , writeMode = req.params.writeMode || req.body.writeMode;

        switch (req.method) {
            case 'GET': // 쓰기, 읽기
                boardLevel = (writeMode == 'r') ? board.readLevel : board.writeLevel;
            break;
            case 'POST'  : // 등록
            case 'PUT'   : // 수정
            case 'DELETE': // 삭제
                boardLevel = (writeMode == 'c') ? board.commentLevel : board.writeLevel;
            break;
        }
        // 접근 권한 체크
        if ( (!req.user && boardLevel > 1)
            || (req.user && boardLevel > req.user.level) ) {
            var error = new Error(); error.status = 403;
            return next(error);
        }
        // 글쓰기 상태일 때 
        if (writeMode == 'w') { return next(); }

        Write.load(req.board._id, id, writeMode, function(err, write) {
            if (err) { return next(err); }
            else if (!write) {
                var error = new Error('게시글이 삭제되었거나, 일치하는 정보가 없습니다.');
                    error.status = 400;
                return next(error);
            }

            // 작성자 체크
            req.isOwner = (req.user && req.user.id === write.user);
            req.write = write;
            next();
        });
    },
    // :commentId
    loadComment: function(req, res, next, id) {
        Comment.load(id, function(err, comment) {
            if (err) { return next(err); }
            else if (!comment) {
                var error = new Error('댓글이 삭제되었거나, 일치하는 정보가 없습니다.');
                    error.status = 400;
                return next(error);
            }

            // 작성자 체크, Override
            req.isOwner = (req.user && req.user.id === comment.user);
            req.comment = comment;
            next();
        });
    },
    list: function(req, res) {
        // 리스트 접근 권한 체크
        if ( (!req.user && req.board.listLevel > 1)
            || (req.user && req.board.listLevel > req.user.level) ) {
            return res.sendStatus(403);
        }

        var param = req.query
          , board = req.board
          , list  = []
          , limit = 20
          , page  = param.page || 1;

        var search = { board: board._id };
        if (param.search) { // 게시글 검색
            var regexp = new RegExp(param.search, 'i');
            _.extend(search, { $or: [{ title: regexp }, { content: regexp }]});
        }

        Write.find(search, 'name title fileCount commentCount hits created updated')
            .skip((page - 1) * limit).limit(limit).sort('-created').exec()
            .then(function(result) {
                list = result;

                return Write.count(search).exec();
            }).then(function(count) {
                res.json({
                    boardId: board._id,
                    skin   : board.skin,
                    isWrite: req.isWrite,
                    orderNo: count - (page - 1) * limit,
                    page   : { current: page, last: Math.ceil(count / limit) },
                    count  : count,
                    list   : list
                });
            }).then(null, function(err) {
                res.status(err.code ? 500 : 400).send(err.message);
            });
    },
    create: function(req, res) {
        if (!req.isWrite) {
            return res.sendStatus(403);
        }

        var write = new Write(req.body.data);
            write.board   = req.board._id;
            write.user    = req.user.id;
            write.name    = req.user.name;
            write.content = write.content.replace(/="\/data\/temp\//gi, '="/data/file/'+req.board._id+'/');
            write.ip      = req.ip;

        // 신규 파일
        write.files.forEach(function(file, index) {
            write.files[index].user = req.user.id;
            write.files[index].path = '/data/file/'+req.board._id+'/';
        });
        
        write.save(function(err, data) {
            if (err) { return res.status(500).send(err); }

            res.json({
                writeId: data._id
            });
        });
    },
    update: function(req, res) {
        if (!req.isOwner) {
            return res.sendStatus(403);
        }

        var oldFiles = req.write.files; // 기존 파일, extend 전에 선언
        var write = _.extend(req.write, req.body.data);

        // 기존 파일이 전송된 파일 리스트에 없다면 삭제 처리
        _.filter(oldFiles, function(file) {
            return !_.findWhere(write.files, { name: file.name });
        }).forEach(function(file) {
            file.remove(); // Need _id
        });
        // 신규 파일
        write.files.forEach(function(file, index) {
            if (!file.isNew) {
                return index;
            }

            write.files[index].user = req.user.id;
            write.files[index].path = '/data/file/'+req.board._id+'/';
            file.save();
        });

        write.update({
            title  : write.title,
            content: write.content.replace(/="\/data\/temp\//gi, '="/data/file/'+req.board._id+'/'),
            files  : write.files,
            ip     : req.ip
        }, function(err) {
            if (err) { return res.status(500).send(err); }

            res.json(true);
        });
    },
    read: function(req, res) {
        if (req.params.writeMode == 'u' && !req.isOwner) {
            return res.sendStatus(403);
        }

        var session = req.session
          , board = req.board
          , write = req.write;

        if (!write) { // 새글쓰기
            return res.json({
                boardId: board._id,
                skin   : board.skin,
                data   : write
            });
        }

        // 조회수 +1
        session.viewed = session.viewed || {};

        var viewId = board._id+'.'+write._id;
        if (!session.viewed[viewId]) {
            write.update({ $inc: { hits: 1 }}).exec();
            session.viewed[viewId] = true;
        }

        _refineComment(write, req.user, req.query, function(err, page) {
            if (err) { return res.status(500).send(err); }

            // Mongoose 객체를 Object로, 뷰에 노출하지 않아야될 필드 제거
            write = _.omit(write.toObject(), ['__v','user']);
            
            res.json({
                skin     : board.skin,
                data     : write,
                isOwner  : req.isOwner,
                isWrite  : req.isWrite,
                isComment: req.isComment,
                coPage   : page
            });
        });
    },
    remove: function(req, res) {
        if (!req.isOwner) {
            return res.sendStatus(403);
        }

        var write = req.write;

        write.remove(function(err) {
            if (err) { return res.status(500).send(err); }

            res.json(true);
        });
    },
    listComment: function(req, res) {
        _refineComment(req.write, req.user, req.query, function(err, page) {
            if (err) { return res.status(500).send(err); }

            res.json({
                list: req.write.comments,
                page: page
            });
        });
    },
    createComment: function(req, res) {
        if (!req.isComment) {
            return res.sendStatus(403);
        }

        var comment = new Comment(req.body);
            comment.board = req.board._id;
            comment.write = req.write._id;
            comment.user  = req.user.id;
            comment.name  = req.user.name;
            comment.ip    = req.ip;

        comment.save().then(function(data) {
            return data.populate('reply', 'parent depth name').execPopulate();
        }).then(function(data) {
            return data.update({
                parent: data.reply ? data.reply.parent : data._id,
                depth : data.reply ? data.reply.depth+1 : 1
            }).exec();
        }).then(function(data, affected) {
            res.json(_.omit(comment.toObject(), ['__v','user','parent','ip']));
        }).then(null, function(err) {
            res.status(500).send(err.message);
        });
    },
    updateComment: function(req, res) {
        if (!req.isOwner || req.comment.isDel || req.comment.replyCount) {
            return res.sendStatus(403);
        }

        var comment = _.extend(req.comment, req.body);

        comment.update({
            content: comment.content,
            ip     : req.ip
        }, function(err) {
            if (err) { return res.status(500).send(err); }

            // res.json(_.omit(comment.toObject(), ['__v','user','parent','ip']));
            res.json({
                _id    : comment._id,
                content: comment.content
            });
        });
    },
    removeComment: function(req, res) {
        if (!req.isOwner) {
            return res.sendStatus(403);
        }

        var comment = req.comment;

        Comment.count({
            board: comment.board, write: comment.write, reply: comment._id
        }).exec().then(function(count) {
            if (count > 0) { // 삭제 댓글이 답글의 대상이라면
                return comment.update({
                    isDel  : true,
                    content: '삭제한 댓글입니다.',
                    ip     : req.ip
                });
            } else { // 답글이 없다면 그냥 삭제
                return comment.remove();
            }
        }).then(function(result) {
            res.json(true);
        }).then(null, function(err) {
            res.status(500).send(err.message);
        });
    },
};


module.exports = boardControllers;



