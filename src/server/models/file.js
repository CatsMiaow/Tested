import fs from 'fs';
import mongoose from '../config/mongo';
import config from '../config';

const FileSchema = new mongoose.Schema({
  user: { type: String, ref: 'User', required: true, select: false },
  path: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  orig: { type: String, required: true, trim: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  created: { type: Date, default: Date.now },
});

FileSchema.pre('save', function (next) {
  // 임시 폴더에서 파일 이동
  fs.rename(
    `${config.path.public}/data/temp/${this.name}`,
    config.path.public + this.path + this.name,
    err => {
      if (err) {
        console.error(err);
      }
    });

  next();
});

FileSchema.pre('remove', function (next) {
  fs.unlink(config.path.public + this.path + this.name, err => {
    if (err) {
      console.error(err);
    }
  });

  next();
});

FileSchema.static({

});


export default mongoose.model('File', FileSchema);
