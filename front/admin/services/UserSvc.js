'use strict';

var services = require('./_services');

services.factory('User', ['Resource', '$route', '$q', 'Session',
  function (Resource, $route, $q, Session) {
    var user = {};

    user.Rest = Resource('user/:id/:controller', {
      id: '@_id',
      controller: '@controller'
    });

    user.list = function (param) {
      var delay = $q.defer();
      var config = { // 기본값
        id: $route.current.params.id
      };
      var search = Session.search['admin-user'];

      angular.extend(config, param);

      if (search) { // 검색 히스토리
        config.page = config.page || search.page;
        config.search = config.search || search.text;
      }

      user.Rest.get(config, function (result) {
        delay.resolve(result);
      }, function () {
        delay.reject('Execution Error - User:list');
      });

      return delay.promise;
    };

    user.view = function () {
      var delay = $q.defer();

      user.Rest.get({
        id: $route.current.params.id
      }, function (result) {
        delay.resolve(result);
      }, function () {
        delay.reject('Execution Error - User:view');
      });

      return delay.promise;
    };

    return user;
  }
]);
