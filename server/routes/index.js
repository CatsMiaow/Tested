'use strict';

var index = require('../controllers/index');

module.exports = function (router, pass) {
  router.get('/', index.render);
  router.get('/admin/*', index.admin);

  // 사용자 세션 데이터 보내기
  router.get('/session', index.session);

  // AngularJS $routeProvider templateUrl
  router.get('/views/*', index.views);

  // 서버 상태 체크
  router.get('/health', index.health);

  // Front bundle deploy
  router.get('/deploy', pass.ensureAdmin, index.deploy);

  // 초기 설치 데이터 세팅
  router.get('/init', index.init);

  // AngularJS html5Mode
  router.get('/*', index.html5Mode);
};
