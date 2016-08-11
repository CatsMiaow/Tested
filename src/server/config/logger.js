import { dirname } from 'path';
import _ from 'lodash';
import moment from 'moment';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '.';
import { ts } from '../modules';

const rootDir = dirname(require.main.filename);

// Error Stack 분석
const splitStackTrace = err => {
  const lines = err.stack.split('\n').slice(1);
  // winston stack 시작의 바로 전 단계가 호출 파일
  const lineMatch = lines[9].match(/at (?:(.+)\s+)?\(?(?:(.+?):(\d+):(\d+)|([^)]+))\)?/);

  if (lineMatch[2] !== null && lineMatch[3] !== null) {
    const fileName = lineMatch[2].split(rootDir)[1];

    return {
      fileName,
      line: lineMatch[3],
      full: `${fileName}:${lineMatch[3]}` };
  }

  return null;
};

const defaultOption = { // 기본 옵션 설정
  timestamp() {
    return moment().format('Y-MM-DD HH:mm:ss');
  },
  formatter(options) {
    const stackInfo = splitStackTrace(new Error());

    return ts`${options.timestamp()} - ${options.level}:
      ${(options.message || '') +
        (options.meta
          && Object.keys(options.meta).length ? `\n\t${JSON.stringify(options.meta)}` : '') +
        (stackInfo ? ` - ${stackInfo.full}` : '')}`;
  },
  json: false,
};

// error, warn, info, verbose, debug, silly
const logger = new (winston.Logger)({
  transports: [
    new DailyRotateFile(_.extend(defaultOption, {
      name: 'all-log',
      filename: `${config.path.log}/tested.log`,
      datePattern: '-yyyyMMdd',
    })),
    new (winston.transports.File)(_.extend(defaultOption, {
      name: 'error-log',
      level: 'error',
      filename: `${config.path.log}/tested-error.log`,
      maxsize: 1024 * 1024 * 25, // 25MB
      // maxFiles: 10,
    })),
  ],
  exitOnError: false,
});


// 콘솔 출력 추가
if (config.env === 'localhost') {
  logger.add(winston.transports.Console);
}


export default logger;
