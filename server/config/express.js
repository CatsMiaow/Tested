'use strict';

var express = require('express')
  , pass = require('../config/passport') // passport config
  , appPath = process.cwd();

/*<Express 미들웨어>*/
var passport       = require('passport')
  , favicon        = require('serve-favicon')
  , morgan         = require('morgan') // logger
  , bodyParser     = require('body-parser')
  , compress       = require('compression')
  , cookieParser   = require('cookie-parser')
  , helmet         = require('helmet')
  , session        = require('express-session')
  , mongoStore     = require('connect-mongo')(session)
  , methodOverride = require('method-override')
  , csrf           = require('csurf')
  , expressValidator = require('express-validator');
/*</Express 미들웨어>*/


module.exports = function(app, mongo) {
    var router = express.Router();
    
    // All Environments
    app.set('views', appPath + '/views');
    app.set('view engine', 'jade');
    app.use(favicon(appPath + '/public/favicon.ico'));
    //app.use(morgan('dev'));
    app.use(compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        }, level: 9
    }));
    app.use(bodyParser.urlencoded({ extended:true }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(session({
        secret: 'Secret Key',
        cookie: { maxAge: 86400000 }, // 1day
        store: new mongoStore({
            mongooseConnection: mongo.connection,
            collection: 'sessions'
        }),
        resave: true,
        saveUninitialized: true
    }));
    app.use(csrf());
    app.use(expressValidator());
    app.use(express.static(appPath + '/public'));
    app.use(passport.initialize());
    app.use(passport.session());

    // https://github.com/evilpacket/helmet
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');

    // XSRF, AngularJS 보안 접두어 ")]}',\n" 는 어떻게 붙이지?
    app.use(function(req, res, next) {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });

    /**
     * router 적용 시점을 기준으로
     * 위에는 전역 핸들링
     * 아래는 에러 핸들링
     */
    app.use(router);

    // catch 404 and forwarding to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
            err.status = 404;
        next(err);
    });

    // development error handler
    // will print stacktrace
    // if (app.get('env') === 'development') { ... }
    app.use(function(err, req, res, next) {
        if (err.status == 500) {
            console.error(err.stack);
        }
        res.status(err.status || 500).send(err.message);
    });

    return [router, pass];
}