'use strict';

var browserify = require('browserify')
  , path = require('path')
  , fs = require('fs')
  , bundlePath = path.join(__dirname, 'public', 'bundle.js');

browserify('main.js', {
    basedir: './public/system',
    paths: ['../vendor']
}).on('error', function(err) {
    console.error(err);
}).require('../vendor/tinymce/tinymce.js', {
    expose: 'tinymce'
}).require('../vendor/moment/min/moment-with-locales.js', {
    expose: 'moment'
}).bundle().pipe(fs.createWriteStream(bundlePath));