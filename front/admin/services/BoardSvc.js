'use strict';

var services = require('./_services');

services.factory('Board', ['Resource', '$route', '$q', 'Session',
  function (Resource, $route, $q, Session) {
    var board = {};

    board.Rest = Resource('board/:id/:controller', {
      id: '@_id',
      controller: '@controller'
    });

    board.list = function (param) {
      var delay = $q.defer();
      var config = { // 기본값
        id: $route.current.params.id
      };
      var search = Session.search['admin-board'];

      angular.extend(config, param);

      if (search) { // 검색 히스토리
        config.page = config.page || search.page;
        config.search = config.search || search.text;
      }

      board.Rest.get(config, function (result) {
        delay.resolve(result);
      }, function () {
        delay.reject('Execution Error - Board:list');
      });

      return delay.promise;
    };

    board.write = function () {
      var delay = $q.defer();

      board.Rest.get({
        id: $route.current.params.id
      }, function (result) {
        delay.resolve(result);
      }, function () {
        delay.reject('Execution Error - Board:write');
      });

      return delay.promise;
    };

    return board;
  }
]);
