'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var VisitSchema = new Schema({
    referer: { type:String, trim:true },
    agent  : { type:String, trim:true },
    created: { type:Date, default:Date.now }
});

VisitSchema.pre('save', function(next) {
    next();
});

VisitSchema.static({
    
});


mongoose.model('Visit', VisitSchema);