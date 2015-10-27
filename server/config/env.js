'use strict';

var _ = require('underscore');

// 공통설정
var config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 8000
}

// 개발환경설정
var environment = {
    localhost: {
        mongo: {
            uri: 'mongodb://localhost:27017/tested',
            options: {
                server: { poolSize: 10 }
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
                server: { poolSize: 10 }
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
                server: { poolSize: 20 }
            }
        },
        redis: {
            port: 6379,
            host: 'localhost',
            options: {}
        }
    }
}


module.exports = _.extend(config, environment[config.env]);