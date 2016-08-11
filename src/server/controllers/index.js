import path from 'path';
import fs from 'fs';
import mongoose from '../config/mongo';
import { wrap, async } from '../modules';

let isDeploy = false;
let manifest = {};

// bundle.js reload
const bundlePath = () => {
  if (!isDeploy) {
    isDeploy = true;
    manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../manifest.json')));
    manifest.public = path.basename(manifest.public);
    manifest.admin = path.basename(manifest['private/admin']);
  }

  return manifest;
};

const indexController = {
  render(req, res) {
    res.render('index', {
      bundle: bundlePath().public,
    });
  },
  views(req, res) {
    res.render(req.params[0]);
  },
  session(req, res) {
    res.json(req.user);
  },
  health(req, res) {
    res.status(200).send(new Buffer(JSON.stringify({
      pid: process.pid,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    })));
  },
  deploy(req, res) {
    isDeploy = false;
    res.json(bundlePath());
  },
  html5Mode(req, res, next) {
    if (req.path.indexOf('/v/') === 0) { // API 주소 통과, req.query.t
      return next();
    }

    return indexController.render(req, res);
  },
  admin(req, res, next) {
    if (req.path.indexOf('/v/admin/') === 0) {
      return next();
    }

    return res.render('admin/index', {
      bundle: bundlePath().admin,
    });
  },
  init: wrap(async(function* (req, res) {
    const Board = mongoose.model('Board');
    const User = mongoose.model('User');

    const count = yield Board.where('_id').in(['notice', 'talk']).count();
    if (count > 0) {
      throw new Error('AlreadyExists');
    }

    // 기본 게시판, 관리자 추가
    yield new Board({ _id: 'notice', title: '공지사항', writeLevel: 10 }).save();
    yield new Board({ _id: 'talk', title: '자유게시판' }).save();
    yield new User({
      _id: 'admin',
      password: 'password',
      level: 10,
      nickname: '관리자',
      email: 'admin@tested.co.kr' }).save();

    res.sendStatus(200);
  })),
};

export default indexController;
