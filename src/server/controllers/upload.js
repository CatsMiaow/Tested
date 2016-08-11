import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import config from '../config';


export default {
  uploader: multer({
    storage: multer.diskStorage({
      destination(req, file, cb) {
        cb(null, `${config.path.public}/data/temp`);
      },
      filename(req, file, cb) {
        const extName = path.extname(file.originalname);
        const fileName = path.basename(file.originalname, extName);

        const randomString = file.fieldname + fileName + Date.now() + Math.random();
        const newFileName = crypto.createHash('md5').update(randomString).digest('hex');

        cb(null, newFileName + extName);
      },
    }),
    fileFilter(req, file, cb) {
      const acceptFileTypes = /^image\/(gif|jpe?g|png)$/i;
      if (!acceptFileTypes.test(file.mimetype)) {
        return cb(new Error('NotImage'));
      }

      return cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
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
   * @apiError NotImage 이미지가 아님
   */
  image(req, res) {
    if (req.uploadError) {
      return res.status(400).json({ message: req.uploadError });
    }

    const file = req.file;
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
   * @apiError InvalidFile 잘못된 파일
   */
  remove(req, res) {
    const acceptFile = /^\/data\/temp\/\w+\.(gif|jpe?g|png)$/i;
    if (!acceptFile.test(req.body.file)) {
      return res.status(400).json({ message: 'InvalidFile' });
    }

    fs.unlink(config.path.public + req.body.file, err => {
      if (err) {
        return res.status(500).send(err);
      }

      res.sendStatus(200);
    });
  },
};
