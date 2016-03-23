'use strict';

var controllers = require('./_controllers');

controllers.controller('UserListCtrl', ['$scope', '$location', 'User', 'initData',
  function ($scope, $location, User, initData) {
    var user = initData.user;

    $scope.total = $scope.orderNo = user.count;
    $scope.list = user.list;
    $scope.page = user.page;

    $scope.userDetail = function (id) {
      $location.path('user/' + id);
    };

    $scope.pageChanged = function (page) {
      User.list({ page: page }).then(function (data) {
        $scope.list = data.list;
        $scope.orderNo = data.orderNo;
        $scope.page = data.page;
      });
    };
  }
]);

controllers.controller('UserViewCtrl', ['$scope', 'initData',
  function ($scope, initData) {
    $scope.user = initData.user;
  }
]);
