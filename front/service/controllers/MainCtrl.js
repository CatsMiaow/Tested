'use strict';

var controllers = require('./_controllers');

controllers.controller('MainCtrl', ['$scope', '$location', 'initData',
  function ($scope, $location, initData) {
    $scope.notice = initData.latest.notice;
    $scope.talk = initData.latest.talk;
    $scope.comment = initData.latest.comment;

    $scope.viewDetail = function (board, id, co) {
      if (co) { $location.hash('c' + co); }
      $location.path('board/' + board + '/view/' + id);
    };
  }
]);
