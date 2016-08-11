import mongoose, { autoIncrement } from '../config/mongo';

const CommentSchema = new mongoose.Schema({
  _id: { type: Number },
  board: { type: String, ref: 'Board', required: true },
  write: { type: Number, ref: 'Write', required: true },
  user: { type: String, ref: 'User', required: true },
  parent: { type: Number }, // 최상위 댓글
  depth: { type: Number }, // 댓글 깊이
  reply: { type: Number, ref: 'Comment' }, // 답글 대상
  replyCount: { type: Number, default: 0 }, // 답글 개수
  name: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  ip: { type: String, select: false },
  isDel: { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

CommentSchema.pre('update', function (next) {
  this.update({}, { $set: { updated: Date.now() } });

  next();
});

CommentSchema.post('save', function (comment) {
  // 댓글 카운트 증가
  this.model('Board').findByIdAndUpdate(comment.board, { $inc: { commentCount: 1 } }).exec();
  this.model('Write').findByIdAndUpdate(comment.write, {
    $inc: { commentCount: 1 }, $push: { comments: comment._id } }).exec();

  if (comment.reply) { // 답글이라면 원글의 댓글 카운트 증가
    comment.populate('reply', (err, data) => {
      data.reply.update({ $inc: { replyCount: 1 } }).exec();
    });
  }
});

CommentSchema.post('remove', function (comment) {
  // 댓글 카운트 감소
  this.model('Board').findByIdAndUpdate(comment.board, { $inc: { commentCount: -1 } }).exec();
  this.model('Write').findByIdAndUpdate(comment.write, {
    $inc: { commentCount: -1 }, $pull: { comments: comment._id } }).exec();

  if (comment.reply) { // 답글이라면 원글의 댓글 카운트 감소
    comment.populate('reply', (err, data) => {
      data.reply.update({ $inc: { replyCount: -1 } }).exec();
    });
  }
});

CommentSchema.static({
  load(id) {
    return this.findOne({ _id: id });
  },
});

CommentSchema.plugin(autoIncrement.plugin, {
  model: 'Comment', field: '_id', startAt: 1 });

export default mongoose.model('Comment', CommentSchema);
