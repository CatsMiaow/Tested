'use strict';

var services = require('./_services');

services.factory('User', ['Resource', '$route', '$q',
  function (Resource, $route, $q) {
    var user = {};

    user.Rest = Resource('user/:controller', {
      controller: '@controller'
    }, {
      login: { method: 'POST', params: { controller: 'login' } },
      logout: { method: 'GET', params: { controller: 'logout' } }
    });

    user.get = function () {
      var delay = $q.defer();

      user.Rest.get(function (result) {
        delay.resolve(result);
      }, function () {
        delay.reject('Execution Error');
      });

      return delay.promise;
    };

    user.login = function (idpw) {
      var delay = $q.defer();

      user.Rest.login(idpw, function (result) {
        delay.resolve(result);
      }, function () {
        delay.reject('Execution Error');
      });

      return delay.promise;
    };

    user.logout = function () {
      var delay = $q.defer();

      user.Rest.logout(function (result) {
        delay.resolve(result);
      }, function () {
        delay.reject('Execution Error');
      });

      return delay.promise;
    };

    return user;
  }
]);
