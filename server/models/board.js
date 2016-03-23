'use strict';

var mongoose = require('mongoose');
var fs = require('fs');
var config = require('../config');
var Schema = mongoose.Schema;

var BoardSchema = new Schema({
  _id: { type: String, match: /^[a-z0-9]{4,15}$/ },
  title: { type: String, required: true, trim: true },
  listLevel: { type: Number, default: 1 },
  readLevel: { type: Number, default: 1 },
  writeLevel: { type: Number, default: 2 },
  commentLevel: { type: Number, default: 2 },
  skin: { type: String, default: 'basic', trim: true },
  writeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  created: { type: Date, default: Date.now, select: false },
  updated: { type: Date, default: Date.now, select: false }
});

BoardSchema.pre('save', function (next) {
  if (this.isNew) {
    // 파일 폴더 생성
    fs.mkdir(config.path.public + '/data/file/' + this._id, '0707', function (err) {
      if (err) { console.error(err); }
    });
  } else {
    this.updated = new Date();
  }

  next();
});

BoardSchema.post('remove', function (board) {
  console.log(board);
  // 1. Comments 삭제
  // 2. Writes 삭제
  // 3. 파일 폴더 삭제
});


/* <컨트롤러모델함수> */
BoardSchema.static({
  load: function (id, callback) {
    this.findOne({ _id: id }, callback);
  },
  is: function (id) {
    return this.count({ _id: id }).exec();
  }
});
/* </컨트롤러모델함수> */


module.exports = mongoose.model('Board', BoardSchema);
