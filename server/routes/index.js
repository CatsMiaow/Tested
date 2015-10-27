'use strict';

var index = require('../controllers/index');

module.exports = function(router) {
    router.get('/', index.render);

    // 사용자 세션 데이터 보내기
    router.get('/session', index.session);

    // AngularJS $routeProvider templateUrl
    router.get('/views/*', index.views);

    // 서버 상태 체크
    router.get('/health', index.health);

    // AngularJS html5Mode
    router.get('/*', index.html5Mode);
};