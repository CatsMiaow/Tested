'use strict';

var controllers = require('./_controllers');

controllers.controller('MainCtrl', ['$scope',
  function ($scope) {
    $scope.text = '관리자 메인입니다.';
  }
]);
