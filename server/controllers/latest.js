'use strict';

var mongoose = require('mongoose')
  , _       = require('underscore')
  , Board   = mongoose.model('Board')
  , Write   = mongoose.model('Write')
  , Comment = mongoose.model('Comment');

var _boardList = function(user, board) {
    var search = {
        listLevel: { $lte: user ? user.level : 1 }
    };
    if (board) {
        search._id = board;
    }
    
    return Board.find(search, '_id').exec();
};

var latestControllers = {
    write: function(req, res) {
        req.checkQuery('limit').isInt();
        if (req.validationErrors()) {
            return res.status(400).json({
                message: 'Required Parameter'
            });
        }

        var query = req.query
          , param = req.params;

        _boardList(req.user, param.boardId).then(function(boards) {
            return Write.find({
                board: { $in: _.pluck(boards, '_id') }
            }, '_id title commentCount created').sort('-created').limit(query.limit).exec();
        }).then(function(result) {
            res.json(result);
        }).then(null, function(err) {
            res.status(err.code ? 500 : 400).send(err.message);
        });
    },
    comment: function(req, res) {
        req.checkQuery('limit').isInt();
        if (req.validationErrors()) {
            return res.status(400).json({
                message: 'Required Parameter'
            });
        }

        var query = req.query
          , param = req.params;

        _boardList(req.user, param.boardId).then(function(boards) {
            return Comment.find({
                board: { $in: _.pluck(boards, '_id') },
                isDel: false
            }, '_id board write content created').sort('-created').limit(query.limit).exec();
        }).then(function(result) {
            res.json(result);
        }).then(null, function(err) {
            res.status(err.code ? 500 : 400).send(err.message);
        });
    }
};


module.exports = latestControllers;



