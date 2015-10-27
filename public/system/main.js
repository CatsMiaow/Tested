'use strict';

var nprogress = require('nprogress');
    nprogress.start();

var angular = require('angular'); // global
var moment = require('moment');
require('tinymce'); // global

var app = require('./app');
require('./routes')(app);

// Configs
require('./configs/menuCfg');
// Filters
require('./filters/momentFit');
// Directives
require('./directives/commonDrtv');
require('./directives/formDrtv');
require('./directives/tinymceDrtv');
// Services
require('./services/CommonSvc');
require('./services/UserSvc');
require('./services/LatestSvc');
require('./services/BoardSvc');
// Controllers
require('./controllers/CommonCtrl');
require('./controllers/MainCtrl');
require('./controllers/UserCtrl');
require('./controllers/BoardCtrl');

moment.locale('ko');

angular.element(document).ready(function() {
    angular.bootstrap(document, ['Tested']);
});

app.run(['Socket', 'Alert',
    function(Socket, Alert) {
        Socket.on('connect', function() {
            // Alert.accent('서버에 접속되었습니다.');
        });
        Socket.on('reconnect', function() {
            Alert.info('서버에 재접속되었습니다.');
        });
        Socket.on('reconnecting', function() {
            Alert.warn('서버에 재접속을 시도 중입니다.');
        });
        Socket.on('error', function(e) {
            Alert.warn(e || 'A unknown error occurred');
        });
        Socket.on('disconnect', function(e) {
            // Alert.warn('서버 연결이 종료되었습니다.');
        });

        angular.element(document.querySelector('#container')).css('visibility', 'visible');
        nprogress.done();
    }
]);