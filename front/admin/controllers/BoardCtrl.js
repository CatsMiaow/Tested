'use strict';

var controllers = require('./_controllers');

controllers.controller('BoardListCtrl', ['$scope', '$location', 'Board', 'initData',
  function ($scope, $location, Board, initData) {
    var board = initData.board;

    $scope.total = $scope.orderNo = board.count;
    $scope.list = board.list;
    $scope.page = board.page;

    $scope.boardDetail = function (id) {
      $location.path('board/' + id);
    };

    $scope.pageChanged = function (page) {
      Board.list({ page: page }).then(function (data) {
        $scope.list = data.list;
        $scope.orderNo = data.orderNo;
        $scope.page = data.page;
      });
    };
  }
]);

controllers.controller('BoardWriteCtrl', [
  '$scope', '$window', '$location', 'Alert', 'Board', 'initData',
  function ($scope, $window, $location, Alert, Board, initData) {
    $scope.board = initData.board || new Board.Rest();

    $scope.save = function () {
      if ($scope.board.isNew) { // 등록
        $scope.board.$save(function (data) {
          Alert.accent(data.id + ' 게시판이 등록되었습니다.');
          $location.path('/board');
        }, function (res) {
          $scope.form[res.data].$setValidity('unique', false);
        });
      } else { // 수정
        $scope.board.$update(function (data) {
          Alert.accent(data.id + ' 게시판이 수정되었습니다.');
          $location.path('/board');
        });
      }
    };

    // 레벨 증가값
    $scope.range = function (min, max) {
      var input = [];
      var i;

      for (i = min; i <= max; i++) {
        input.push(i);
      }

      return input;
    };
  }
]);
