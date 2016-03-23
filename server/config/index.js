'use strict';

var _ = require('lodash');

// 공통설정
var config = {
  env: process.env.NODE_ENV || 'localhost',
  port: process.env.PORT || 8000,
  path: {
    cwd: process.cwd(),
    public: process.cwd() + '/public',
    private: process.cwd() + '/private',
    log: '../_logs/' }
};

// 개발환경설정
var environment = {
  localhost: {
    mongo: {
      uri: 'mongodb://localhost:27017/tested',
      options: {
        server: { poolSize: 5 }
      }
    },
    redis: {
      port: 6379,
      host: 'localhost',
      options: {}
    }
  },
  development: {
    mongo: {
      uri: 'mongodb://localhost:27017/tested',
      options: {
        user: 'user',
        pass: 'password',
        server: { poolSize: 5 }
      }
    },
    redis: {
      port: 6379,
      host: 'localhost',
      options: {}
    }
  },
  production: {
    mongo: {
      uri: 'mongodb://localhost:27017/tested',
      options: {
        user: 'user',
        pass: 'password',
        server: { poolSize: 5 }
      }
    },
    redis: {
      port: 6379,
      host: 'localhost',
      options: {}
    }
  }
};

environment.test = environment.localhost;

module.exports = _.extend(config, environment[config.env]);
