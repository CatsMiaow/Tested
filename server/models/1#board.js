'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var BoardSchema = new Schema({
    _id         : { type:String, match:/^[a-z0-9]{4,15}$/ },
    title       : { type:String, required:true, trim:true },
    listLevel   : { type:Number, default:1 },
    readLevel   : { type:Number, default:1 },
    writeLevel  : { type:Number, default:2 },
    commentLevel: { type:Number, default:2 },
    skin        : { type:String, default:'basic', trim:true },
    writeCount  : { type:Number, default:0 },
    commentCount: { type:Number, default:0 },
    created     : { type:Date, default:Date.now, select:false },
    updated     : { type:Date, default:Date.now, select:false }
});

BoardSchema.pre('save', function(next) {
    if (!this.isNew) {
        this.updated = new Date();
    }

    next();
});


/*<컨트롤러모델함수>*/
BoardSchema.static({
    load: function(id, callback) {
        this.findOne({ _id: id }, callback);
    }
});
/*</컨트롤러모델함수>*/


mongoose.model('Board', BoardSchema);