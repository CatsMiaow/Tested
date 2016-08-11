import express from 'express';
import { create as domainCreate } from 'domain';

/* <Express 미들웨어> */
import passport from 'passport';
import favicon from 'serve-favicon';
import morgan from 'morgan'; // logger
import bodyParser from 'body-parser';
import compress from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import methodOverride from 'method-override';
import csrf from 'csurf';
import expressValidator from 'express-validator';
/* </Express 미들웨어> */

import mongoose from './mongo';
import config from '.';
import pass from './passport'; // passport config
import logger from './logger';

const MongoStore = connectMongo(session);


export default function (app) {
  const router = express.Router();

  // 권장되진 않지만, 다른 대안도 없고 안전빵으로다가
  app.use((req, res, next) => {
    const d = domainCreate();
    d.add(req);
    d.add(res);
    d.on('error', next);
    d.run(next);
  });

  // All Environments
  app.set('views', `${config.cwd}/views`);
  app.set('view engine', 'jade');
  app.locals.doctype = 'html'; // jade option

  app.use(favicon(`${config.path.public}/favicon.ico`));
  app.use(morgan(':remote-addr - ":method :url HTTP/:http-version" ' +
    ':status :res[content-length] ":referrer" ":user-agent"'));
  app.use(compress({
    filter(req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level: 9,
  }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(session({
    secret: 'Meow Miaow',
    cookie: { maxAge: 86400000 }, // 1day
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      collection: 'sessions' }),
    resave: true,
    saveUninitialized: true,
  }));
  app.use(expressValidator());
  app.use(express.static(config.path.public));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(helmet());

  // 리소스 폴더 접근 권한
  app.use('/admin', pass.ensureAdmin, express.static(`${config.path.private}/admin`));

  // XSRF, AngularJS 보안 접두어 ")]}',\n"
  if (app.get('env') !== 'test') { // 테스트 환경일 때 csrf 예외
    app.use(csrf());
    app.use((req, res, next) => {
      res.cookie('XSRF-TOKEN', req.csrfToken());
      next();
    });
  }

  /**
   * router 적용 시점을 기준으로
   * 위에는 전역 핸들링
   * 아래는 에러 핸들링
   */
  app.use(router);

  // catch 404 and forwarding to error handler
  app.use((req, res, next) => {
    const err = new Error('NotFound');
    err.status = 404;
    next(err);
  });

  // development error handler
  // will print stacktrace
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    if (err.name !== 'Error' || err.code) {
      err.status = 500;
    }

    if (err.status === 500) {
      console.error(err);
      const message = `${req.method}: ${req.originalUrl}\n` +
                      `IP> ${req.ip}, Body> ${JSON.stringify(req.body)}\n` +
                      `Headers> ${JSON.stringify(req.headers)}\n${err.stack}`;

      logger.error(message);
      // mailer('uncaughtException', message);
    }

    res.status(err.status || 400).json({ message: err.message });
  });

  return [router, pass];
}
