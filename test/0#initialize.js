'use strict';

var fs = require('fs');
var mongoose = require('mongoose');
var mongodb;

// 테스트 전 초기화 작업
describe('Initialize', function () {
  before(function (done) {
    var config = require('../server/config');

    // MongoDB Connect
    mongodb = mongoose.createConnection(config.mongo.uri);
    mongodb.on('connected', function () {
      done();
    }).on('error', function (err) {
      done(err);
    });
  });

  after(function () {
    mongodb.close();
  });

  it('mocha users clear', function (done) {
    mongodb.collection('users').remove({ _id: 'mocha' }, done);
  });

  it('mocha boards clear', function (done) {
    fs.rmdir('public/data/file/mocha', function () { // 파일 폴더 삭제
      mongodb.collection('boards').remove({ _id: 'mocha' }, done);
    });
  });

  it('mocha writes clear', function (done) {
    mongodb.collection('writes').remove({ board: 'mocha' }, done);
  });

  it('mocha comments clear', function (done) {
    mongodb.collection('comments').remove({ board: 'mocha' }, done);
  });
});
