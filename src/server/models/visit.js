import mongoose from '../config/mongo';

const VisitSchema = new mongoose.Schema({
  referer: { type: String, trim: true },
  agent: { type: String, trim: true },
  created: { type: Date, default: Date.now },
});

VisitSchema.pre('save', function (next) {
  console.log(this);
  next();
});

VisitSchema.static({

});


export default mongoose.model('Visit', VisitSchema);
