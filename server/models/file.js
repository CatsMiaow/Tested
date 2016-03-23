'use strict';

var mongoose = require('mongoose');
var fs = require('fs');
var config = require('../config');
var Schema = mongoose.Schema;

var FileSchema = new Schema({
  user: { type: String, ref: 'User', required: true },
  path: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  orig: { type: String, required: true, trim: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  created: { type: Date, default: Date.now }
});

FileSchema.pre('save', function (next) {
  // 임시 폴더에서 파일 이동
  fs.rename(
    config.path.public + '/data/temp/' + this.name,
    config.path.public + this.path + this.name,
    function (err) {
      if (err) { console.error(err); }
    });

  next();
});

FileSchema.pre('remove', function (next) {
  fs.unlink(config.path.public + this.path + this.name, function (err) {
    if (err) { console.error(err); }
  });

  next();
});

FileSchema.static({

});


module.exports = mongoose.model('File', FileSchema);
