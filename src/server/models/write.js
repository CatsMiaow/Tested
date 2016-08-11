import fs from 'fs';
import mongoose, { autoIncrement } from '../config/mongo';
import config from '../config';

const WriteSchema = new mongoose.Schema({
  _id: { type: Number },
  board: { type: String, ref: 'Board', required: true },
  user: { type: String, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  files: [mongoose.model('File').schema],
  fileCount: { type: Number, default: 0 },
  comments: { type: [{ type: Number, ref: 'Comment' }], select: false },
  commentCount: { type: Number, default: 0 },
  hits: { type: Number, default: 0 },
  ip: { type: String, select: false },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

WriteSchema.pre('save', function (next) {
  this.fileCount = this.files.length;

  next();
});

WriteSchema.pre('update', function (next) {
  const update = this._update;

  if (update.$set && update.$set.title) {
    this.update({}, { $set: {
      fileCount: update.$set.files.length,
      updated: Date.now(),
    } });
  }

  next();
});

WriteSchema.post('save', function (write) {
  // 게시글 카운트 증가
  this.model('Board').findByIdAndUpdate(write.board, { $inc: { writeCount: 1 } }).exec();
});

WriteSchema.post('remove', function (write) {
  // 댓글 삭제
  this.model('Comment').remove({ board: write.board, write: write._id }).exec();
  // 게시글 카운트 감소
  this.model('Board').findByIdAndUpdate(write.board, {
    $inc: { writeCount: -1, commentCount: write.commentCount * -1 } }).exec();

  // 파일 삭제
  write.files.forEach(file => {
    fs.unlink(config.path.public + file.path + file.name, err => {
      if (err) {
        // FileSchema.pre('remove')에서 선 처리되어 오류가 발생함
        // console.error(err);
      }
    });
  });
});


/* <컨트롤러모델함수> */
WriteSchema.static({
  load(board, id, writeMode) {
    return this.findOne({ board, _id: id }, (writeMode === 'r') ? '+comments -files' : null);
  },
});
/* </컨트롤러모델함수> */


WriteSchema.plugin(autoIncrement.plugin, {
  model: 'Write', field: '_id', startAt: 1 });

export default mongoose.model('Write', WriteSchema);
