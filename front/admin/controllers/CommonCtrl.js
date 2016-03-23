'use strict';

var controllers = require('./_controllers');

controllers.controller('CommonCtrl', [
  '$scope', '$window', '$location', '$filter', '$mdSidenav', 'Alert', 'Session', 'menu',
  function ($scope, $window, $location, $filter, $mdSidenav, Alert, Session, menu) {
    /* <$scope> */
    $scope.menu = menu.nav; // 메뉴

    // 로그아웃
    $scope.logout = function () {
      Session.logout().success(function () {
        Session.destory();
        $window.location.href = '/';
      });
    };
    // 왼쪽메뉴
    $scope.toggleSidenav = function () {
      $mdSidenav('left').toggle();
    };
    /* </$scope> */

    /* <$on> */
    // 라우트 에러 처리
    $scope.$on('$routeChangeError', function (event, current, previous, rejection) {
      switch (rejection) {
        case 'accessDenied': $scope.$broadcast('event:permissionRequired'); break;
        // no default
      }
    });
    // 접근 권한 이벤트
    $scope.$on('event:permissionRequired', function () {
      Session.destory();
      $window.location.href = '/';
    });
    // 오류 처리
    $scope.$on('event:error', function (event, err) {
      Alert.warn(err.data || 'Error: ' + err.status + ' ' + err.statusText);
    });
    // $scope.$on('$viewContentLoaded', function() {});
    // $scope.$on('$routeChangeStart', function(event, current, previous) {});
    $scope.$on('$locationChangeStart', function () { // event, next, current
      var path = { page: $location.path().split('/').slice(1, 2).join('/') || 'admin' };
      var page = $filter('filter')(menu.nav, path, true)[0];

      $mdSidenav('left').close(); // 메뉴바 닫기
      if (!page) { // 메뉴에 없으면 페이지에서 찾기
        page = $filter('filter')(menu.page, path, true)[0] || {};
      }

      $scope.title = page.title;
    });
    /* </$on> */
  }
]);
