'use strict';

var mongoose = require('mongoose')
  , autoIncrement = require('mongoose-auto-increment')
  , fs = require('fs')
  , Schema = mongoose.Schema
  , Board = mongoose.model('Board')
  , publicPath = process.cwd()+'/public';

var WriteSchema = new Schema({
    _id         : { type:Number },
    board       : { type:String, ref:'Board', required:true },
    user        : { type:String, ref:'User', required:true },
    name        : { type:String, required:true, trim:true },
    title       : { type:String, required:true, trim:true },
    content     : { type:String, required:true, trim:true },
    files       : [mongoose.model('File').schema],
    fileCount   : { type:Number, default:0 },
    comments    : { type:[{ type:Number, ref:'Comment' }], select:false },
    commentCount: { type:Number, default:0 },
    hits        : { type:Number, default:0 },
    ip          : { type:String, select:false },
    created     : { type:Date, default:Date.now },
    updated     : { type:Date, default:Date.now }
});

WriteSchema.pre('save', function(next) {
    this.fileCount = this.files.length;

    next();
});

WriteSchema.pre('update', function(next) {
    var update = this._update;

    if (update.$set && update.$set.title) {
        this.update({}, { $set: {
            fileCount: update.$set.files.length,
            updated  : Date.now()
        }});
    }

    next();
});

WriteSchema.post('save', function(write) {
    // 게시글 카운트 증가
    Board.findByIdAndUpdate(write.board, { $inc: { writeCount: 1 }}).exec();
});

WriteSchema.post('remove', function(write) {
    // 게시글 카운트 감소
    Board.findByIdAndUpdate(write.board, { $inc: { writeCount: -1 }}).exec();

    // 파일 삭제
    write.files.forEach(function(file) {
        fs.unlink(publicPath+file.path+file.name, function(err) {
            if (err) { console.error(error); }
        });
    });
});


/*<컨트롤러모델함수>*/
WriteSchema.static({
    load: function(board, id, writeMode, callback) {
        this.findOne({
            board: board, _id: id
        }, (writeMode == 'r') ? '+comments -files' : null, callback);
    }
});
/*</컨트롤러모델함수>*/


WriteSchema.plugin(autoIncrement.plugin, {
    model: 'Write', field: '_id', startAt: 1
});
mongoose.model('Write', WriteSchema);
