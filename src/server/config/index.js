import { merge } from 'lodash';

// Current Working Directory
const cwd = process.cwd();

// 공통설정
const config = {
  env: process.env.NODE_ENV || 'localhost',
  port: process.env.PORT || 8000,
  cwd,
  path: {
    public: `${cwd}/resource/public`,
    private: `${cwd}/resource/private`,
    log: './logs' },
};

// 개발환경설정
const environment = {
  localhost: {
    mongo: {
      uri: 'mongodb://localhost:27017/tested',
      options: {
        server: { poolSize: 5 },
      },
    },
    redis: {
      port: 6379,
      host: 'localhost',
      options: {},
    },
  },
  development: {
    mongo: {
      uri: 'mongodb://localhost:27017/tested',
      options: {
        user: 'user',
        pass: 'password',
        server: { poolSize: 5 },
      },
    },
    redis: {
      port: 6379,
      host: 'localhost',
      options: {},
    },
  },
  production: {
    mongo: {
      uri: 'mongodb://localhost:27017/tested',
      options: {
        user: 'user',
        pass: 'password',
        server: { poolSize: 5 },
      },
    },
    redis: {
      port: 6379,
      host: 'localhost',
      options: {},
    },
  },
};

environment.test = environment.localhost;

export default merge(config, environment[config.env]);
