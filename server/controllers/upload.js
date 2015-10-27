'use strict';

var fs      = require('fs')
  , multer  = require('multer')
  , crypto  = require('crypto')
  , path    = require('path')
  , appPath = process.cwd();


var uploadControllers = {
    uploader: multer({
        storage: multer.diskStorage({
            destination: function(req, file, cb) {
                cb(null, appPath + '/public/data/temp');
            },
            filename: function(req, file, cb) {
                var extName  = path.extname(file.originalname)
                  , fileName = path.basename(file.originalname, extName);

                var randomString = file.fieldname + fileName + Date.now() + Math.random()
                  , newFileName  = crypto.createHash('md5').update(randomString).digest('hex');

                cb(null, newFileName + extName);
            }
        }),
        fileFilter: function(req, file, cb) {
            var acceptFileTypes = /^image\/(gif|jpe?g|png)$/i;
            if (!acceptFileTypes.test(file.mimetype)) {
                return cb(new Error('이미지 파일이 아닙니다.'));
            }

            cb(null, true);
        },
        limits: {
            fileSize: 2 * 1024 * 1024
        }
    }).single('file'),
    image: function(req, res) {
        // if (req.uploadError) { res.status(400).send(req.uploadError); }

        var file = req.file;
        res.json({
            path: '/data/temp/',
            name: file.filename,
            orig: file.originalname,
            type: file.mimetype,
            size: file.size
        });
    },
    remove: function(req, res) {
        var acceptFile = /^\/data\/temp\/\w+\.(gif|jpe?g|png)$/i;
        if (!acceptFile.test(req.body.file)) {
            return res.status(500).send('잘못된 파일입니다.');
        }

        fs.unlink(appPath + '/public' + req.body.file, function(err) {
            if (err) { return res.status(500).send(err); }

            res.json(true);
        });
    }
};


module.exports = uploadControllers;