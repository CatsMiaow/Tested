'use strict';

var fs = require('fs');
var multer = require('multer');
var crypto = require('crypto');
var path = require('path');
var config = require('../config');


var uploadControllers = {
  uploader: multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, config.path.public + '/data/temp');
      },
      filename: function (req, file, cb) {
        var extName = path.extname(file.originalname);
        var fileName = path.basename(file.originalname, extName);

        var randomString = file.fieldname + fileName + Date.now() + Math.random();
        var newFileName = crypto.createHash('md5').update(randomString).digest('hex');

        cb(null, newFileName + extName);
      }
    }),
    fileFilter: function (req, file, cb) {
      var acceptFileTypes = /^image\/(gif|jpe?g|png)$/i;
      if (!acceptFileTypes.test(file.mimetype)) {
        return cb(new Error('이미지 파일이 아닙니다.'));
      }

      return cb(null, true);
    },
    limits: {
      fileSize: 2 * 1024 * 1024
    }
  }).single('file'),
  /**
   * @api {post} /upload/image 이미지 업로드
   * @apiName PostUploadImage
   * @apiGroup Upload
   * @apiPermission user
   * @apiDescription 이미지 파일을 업로드한다.
   * @apiParam (Body) {String} file 파일 소스
   * @apiSuccess {String} path 업로드 경로
   * @apiSuccess {String} name 업로드 파일명
   * @apiSuccess {String} orig 원본 파일명
   * @apiSuccess {String} type 이미지 유형
   * @apiSuccess {Number} size 파일 크기
   * @apiUse DefaultError
   */
  image: function (req, res) {
    // if (req.uploadError) { res.status(400).send(req.uploadError); }

    var file = req.file;
    res.json({
      path: '/data/temp/',
      name: file.filename,
      orig: file.originalname,
      type: file.mimetype,
      size: file.size });
  },
  /**
   * @api {post} /upload/delete 이미지 삭제
   * @apiName PostUploadDelete
   * @apiGroup Upload
   * @apiPermission user
   * @apiDescription 이미지 파일을 삭제한다.
   * @apiParam (Body) {String} file 파일 경로, /data/temp/파일명
   * @apiUse DefaultError
   */
  remove: function (req, res) {
    var acceptFile = /^\/data\/temp\/\w+\.(gif|jpe?g|png)$/i;
    if (!acceptFile.test(req.body.file)) {
      return res.status(400).send('잘못된 파일입니다.');
    }

    return fs.unlink(config.path.public + req.body.file, function (err) {
      if (err) { return res.status(500).send(err); }

      return res.json(true);
    });
  }
};


module.exports = uploadControllers;
