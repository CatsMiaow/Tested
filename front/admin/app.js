'use strict';

require('angular-route');
require('angular-resource');
require('angular-sanitize');
require('angular-cookies');
require('angular-animate');
require('angular-aria');
require('angular-messages');
require('angular-material');
require('ng-file-upload');
require('angular-moment');

require('./configs/_configs');
require('./controllers/_controllers');
require('./services/_services');
require('./filters/_filters');
require('./directives/_directives');

module.exports = angular.module('Tested-Admin', [
  'ngRoute', 'ngResource', 'ngSanitize', 'ngCookies', 'ngAnimate', 'ngAria', 'ngMessages',
  'ngMaterial', 'ngFileUpload', 'angularMoment',
  'configs', 'controllers', 'services', 'filters', 'directives'
]).config([
  '$httpProvider', '$locationProvider', '$routeProvider', '$animateProvider', '$mdThemingProvider',
  function (
    $httpProvider, $locationProvider, $routeProvider, $animateProvider, $mdThemingProvider) {
    var isInit = false;
    /* .when 커스텀: 인증 resolve 추가, 페이지 접근 전에 인증 검사
     * 인증 실패 시 기존 resolve를 실행하지 않기 위해 커스텀 안에서 처리
     */
    $routeProvider.whenAuth = function (path, route) {
      var resolve = route.resolve; // 기존 resolve

      route.resolve = { // 커스텀으로 대체
        initData: ['$q', '$injector', '$rootScope', 'Session',
          function ($q, $injector, $rootScope, Session) {
            var delay = $q.defer();
            var init = isInit || Session.init;

            // 최초 접근 시 사용자 데이터를 가져옴
            $q.when(init).then(function (user) {
              var locals = {};

              if (!isInit) { // 최초 한번 세팅
                isInit = true;

                Session.set(user.data);
                $rootScope.$watch(function () {
                  return Session;
                }, function () { // 로그인 상태 감지
                  $rootScope.isLogin = Session.isLogin;
                }, true);
              }

              // $routeChangeError 처리
              if (!Session.isLogin) {
                delay.reject('accessDenied');
              } else { // 기존 리솔브를 데이터로 반환
                angular.forEach(resolve, function (value, key) {
                  locals[key] = $injector.invoke(value, null, null, key);
                });

                $q.all(locals).then(function (response) {
                  delay.resolve(response);
                });
              }
            });

            return delay.promise;
          }
        ]
      };

      return $routeProvider.when(path, route);
    };

    // 전역 요청/응답 캐치
    $httpProvider.interceptors.push('HttpInterceptor');
    // DEPRECATED: $httpProvider.responseInterceptors.push('ErrorHttpInterceptor');

    // 요청 헤더 변경
    // $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    // $httpProvider.defaults.headers.common['Authentication'] = 'Key';

    // 요청/응답 데이터 가공
    // $httpProvider.defaults.transformRequest
    // $httpProvider.defaults.transformResponse

    $locationProvider.html5Mode(true); // .hashPrefix('!');

    // 애니메이션 적용 클래스 필터링
    // $animateProvider.classNameFilter(/.*-animate/);

    // Material Default Theme Custom
    $mdThemingProvider.theme('default')
        .primaryPalette('deep-orange')
        .accentPalette('blue')
        .warnPalette('red')
        .backgroundPalette('blue-grey'); // .dark();
  }
]);
