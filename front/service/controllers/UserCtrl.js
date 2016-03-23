'use strict';

var controllers = require('./_controllers');

controllers.controller('UserJoinCtrl', ['$scope', '$location', 'Alert', 'User',
  function ($scope, $location, Alert, User) {
    $scope.user = new User.Rest();

    $scope.save = function () {
      $scope.user.$save(function () {
        Alert.accent('회원 가입이 완료되었습니다. 로그인하세요.');
        $location.path('/user/login');
      }, function (res) {
        $scope.form[res.data].$setValidity('unique', false);
      });
    };
  }
]);

controllers.controller('UserModifyCtrl', ['$scope', '$location', 'Session', 'Alert', 'initData',
  function ($scope, $location, Session, Alert, initData) {
    $scope.user = initData.user;

    $scope.save = function () {
      $scope.user.$update(function () {
        Alert.accent('회원 정보가 수정되었습니다. 다시 로그인하세요.');
        Session.destory();
        $location.path('/user/login');
      }, function (res) {
        $scope.form[res.data].$setValidity('unique', false);
      });
    };
  }
]);

controllers.controller('UserLoginCtrl', ['$scope', '$location', '$routeParams', 'User', 'Session',
  function ($scope, $location, $routeParams, User, Session) {
    $scope.login = function () {
      User.login($scope.user).then(function (data) {
        Session.set(data);
        $location.path($routeParams.url || '/').search({});
      });
    };
  }
]);
