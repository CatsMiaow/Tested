'use strict';

var config;

// 테스트 환경변수
process.env.NODE_ENV = 'test';

config = require('../../server/config');

// 테스트에서 사용할 공통 모듈
global.should = require('chai').should();
global.request = require('supertest').agent('http://localhost:' + config.port + '/v');
