'use strict';

var express = require('express');
var mongoose = require('mongoose');
var pass = require('../config/passport'); // passport config
var config = require('../config');

/* <Express 미들웨어> */
var passport = require('passport');
var favicon = require('serve-favicon');
var morgan = require('morgan'); // logger
var bodyParser = require('body-parser');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var helmet = require('helmet');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var methodOverride = require('method-override');
var csrf = require('csurf');
var expressValidator = require('express-validator');
/* </Express 미들웨어> */


module.exports = function (app) {
  var router = express.Router();

  // All Environments
  app.set('views', config.path.cwd + '/views');
  app.set('view engine', 'jade');
  app.use(favicon(config.path.public + '/favicon.ico'));
  app.use(morgan('combined'));
  app.use(compress({
    filter: function (req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    }, level: 9
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
    saveUninitialized: true
  }));
  app.use(expressValidator());
  app.use(express.static(config.path.public));
  app.use(passport.initialize());
  app.use(passport.session());
  // 관리자 리소스 접근 권한
  app.use('/admin', pass.ensureAdmin, express.static(config.path.private + '/admin'));

  // https://github.com/evilpacket/helmet
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.disable('x-powered-by');

  // XSRF, AngularJS 보안 접두어 ")]}',\n"
  if (app.get('env') !== 'test') { // test에서 csrf 예외 처리
    app.use(csrf());
    app.use(function (req, res, next) {
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
  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // development error handler
  // will print stacktrace
  // if (app.get('env') === 'development') { ... }
  app.use(function (err, req, res, next) {
    if (res.headersSent) {
      return next(err);
    }

    if (err.status === 500) {
      console.error(err.stack);
    }

    return res.status(err.status || 500).send(err.message);
  });

  return [router, pass];
};
