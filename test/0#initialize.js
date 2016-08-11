import fs from 'fs';
import mongoose from 'mongoose';
import config from '../src/server/config';


let mongodb;

// 테스트 전 초기화 작업
describe('Initialize', () => {
  before(done => {
    // MongoDB Connect
    mongodb = mongoose.createConnection(config.mongo.uri);
    mongodb.on('connected', () => {
      done();
    }).on('error', err => {
      done(err);
    });
  });

  after(() => {
    mongodb.close();
  });

  it('mocha users clear', done => {
    mongodb.collection('users').remove({ _id: 'mocha' }, done);
  });

  it('mocha boards clear', done => {
    fs.rmdir('resource/public/data/file/mocha', () => { // 파일 폴더 삭제
      mongodb.collection('boards').remove({ _id: 'mocha' }, done);
    });
  });

  it('mocha writes clear', done => {
    mongodb.collection('writes').remove({ board: 'mocha' }, done);
  });

  it('mocha comments clear', done => {
    mongodb.collection('comments').remove({ board: 'mocha' }, done);
  });
});
