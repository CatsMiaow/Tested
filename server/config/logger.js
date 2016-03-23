'use strict';

var path = require('path');
var _ = require('lodash');
var moment = require('moment');
var winston = require('winston');
var DailyRotateFile = require('winston-daily-rotate-file');
var config = require('.');
var rootDir = path.dirname(require.main.filename);


// Error Stack 분석
var _splitStackTrace = function (err) {
  var lines = err.stack.split('\n').slice(1);
  // winston stack 시작의 바로 전 단계가 호출 파일
  var lineMatch = lines[9].match(/at (?:(.+)\s+)?\(?(?:(.+?):(\d+):(\d+)|([^)]+))\)?/);
  var fileName;

  if (lineMatch[2] !== null && lineMatch[3] !== null) {
    fileName = lineMatch[2].split(rootDir)[1];

    return {
      fileName: fileName,
      line: lineMatch[3],
      full: fileName + ':' + lineMatch[3]
    };
  }

  return null;
};

var _default = { // 기본 옵션 설정
  timestamp: function () {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  },
  formatter: function (options) {
    var stackInfo = _splitStackTrace(new Error());

    return options.timestamp() + ' - '
      + options.level + ': '
      + (undefined !== options.message ? options.message : '')
      + (options.meta
        && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '')
      + (stackInfo ? ' - ' + stackInfo.full : '');
  },
  json: false
};

// error, warn, info, verbose, debug, silly
var logger = new (winston.Logger)({
  transports: [
    new DailyRotateFile(_.extend(_default, {
      name: 'all-log',
      filename: config.path.log + 'tested.log',
      datePattern: '-yyyyMMdd'
    })),
    new (winston.transports.File)(_.extend(_default, {
      name: 'error-log',
      level: 'error',
      filename: config.path.log + 'tested-error.log',
      maxsize: 1024 * 1024 * 25 // 25MB
      // maxFiles: 10,
    }))
  ],
  exitOnError: false
});


// 콘솔 출력 추가
if (config.env === 'localhost') {
  logger.add(winston.transports.Console);
}


module.exports = logger;
