'use strict';

var path = require('path');

var isDeploy = false;
var manifest = {};
var manifestPath = path.join(__dirname, '../../manifest.json');

// bundle.js reload
var _manifest = function () {
  if (!isDeploy) {
    isDeploy = true;
    manifest = require(manifestPath);
    manifest.public = path.basename(manifest.public);
    manifest.admin = path.basename(manifest['private/admin']);
  }

  return manifest;
};

var indexControllers = {
  render: function (req, res) {
    res.render('index', {
      bundle: _manifest().public
    });
  },
  views: function (req, res) {
    res.render(req.params[0]);
  },
  session: function (req, res) {
    res.json(req.user);
  },
  health: function (req, res) {
    res.status(200).send(new Buffer(JSON.stringify({
      pid: process.pid,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    })));
  },
  deploy: function (req, res) {
    delete require.cache[manifestPath];

    isDeploy = false;
    res.json(_manifest());
  },
  html5Mode: function (req, res, next) {
    if (req.path.indexOf('/v/') === 0) { // API 주소 통과, req.query.t
      return next();
    }

    return indexControllers.render(req, res);
  },
  admin: function (req, res, next) {
    if (req.path.indexOf('/v/admin/') === 0) {
      return next();
    }

    return res.render('admin/index', {
      bundle: _manifest().admin
    });
  },
  init: function (req, res) {
    var mongoose = require('mongoose');
    var Board = mongoose.model('Board');
    var User = mongoose.model('User');
    var Q = require('q');

    Board.where('_id').in(['notice', 'talk']).exec('count').then(function (count) {
      if (count > 0) {
        throw new Error('Already Exists.');
      }
      // 기본 게시판, 관리자 추가
      return Q.all([
        new Board({ _id: 'notice', title: '공지사항', writeLevel: 10 }).save(),
        new Board({ _id: 'talk', title: '자유게시판' }).save(),
        new User({ _id: 'admin', password: 'password', level: 10,
          nickname: '관리자', email: 'admin@tested.co.kr' }).save()
      ]);
    }).then(function (result) {
      res.json(result);
    }).then(null, function (err) {
      res.json(err.message);
    });
  }
};


module.exports = indexControllers;
