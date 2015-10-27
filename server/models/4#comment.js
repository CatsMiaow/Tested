'use strict';

var mongoose = require('mongoose')
  , autoIncrement = require('mongoose-auto-increment')
  , Schema = mongoose.Schema
  , Board = mongoose.model('Board')
  , Write = mongoose.model('Write');

var CommentSchema = new Schema({
    _id       : { type:Number },
    board     : { type:String, ref:'Board', required:true },
    write     : { type:Number, ref:'Write', required:true },
    user      : { type:String, ref:'User', required:true },
    parent    : { type:Number }, // 최상위 댓글
    depth     : { type:Number }, // 댓글 깊이
    reply     : { type:Number, ref:'Comment' }, // 답글 대상
    replyCount: { type:Number, default:0 }, // 답글 개수
    name      : { type:String, required:true, trim:true },
    content   : { type:String, required:true, trim:true },
    ip        : { type:String, select:false },
    isDel     : { type:Boolean, default:false },
    created   : { type:Date, default:Date.now },
    updated   : { type:Date, default:Date.now }
});

CommentSchema.pre('update', function(next) {
    this.update({}, { $set: { updated: Date.now() }});
    
    next();
});

CommentSchema.post('save', function(comment) {
    // 댓글 카운트 증가
    Board.findByIdAndUpdate(comment.board, { $inc: { commentCount: 1 }}).exec();
    Write.findByIdAndUpdate(comment.write, { $inc: { commentCount: 1 }, $push: { comments: comment._id }}).exec();
    if (comment.reply) { // 답글이라면 원글의 댓글 카운트 증가
        comment.populate('reply', function(err, data) {
            data.reply.update({ $inc: { replyCount: 1 }}).exec();
        });
    }
});

CommentSchema.post('remove', function(comment) {
    // 댓글 카운트 감소
    Board.findByIdAndUpdate(comment.board, { $inc: { commentCount: -1 }}).exec();
    Write.findByIdAndUpdate(comment.write, { $inc: { commentCount: -1 }, $pull: { comments: comment._id }}).exec();
    if (comment.reply) { // 답글이라면 원글의 댓글 카운트 감소
        comment.populate('reply', function(err, data) {
            data.reply.update({ $inc: { replyCount: -1 }}).exec();
        });
    }
});

CommentSchema.static({
    load: function(id, callback) {
        this.findOne({ _id: id }, callback);
    }
});

CommentSchema.plugin(autoIncrement.plugin, {
    model: 'Comment', field: '_id', startAt: 1
});
mongoose.model('Comment', CommentSchema);