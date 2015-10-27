'use strict';

var upload = require('../controllers/upload');

module.exports = function(router, pass) {
    router.post('/v/upload/image', pass.authenticated, upload.uploader, upload.image);
    router.post('/v/upload/delete', pass.authenticated, upload.remove);
};