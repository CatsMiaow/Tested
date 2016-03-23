'use strict';

var nprogress = require('nprogress');
var services = require('./_services');

// 에러메시지 관리
services.factory('Alert', ['$mdToast', '$mdDialog',
  function ($mdToast, $mdDialog) {
    var toast = function (style, msg) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(msg)
          .action('x')
          .highlightAction(false)
          .position('top'));
    };

    return {
      info: function (msg) {
        toast('md-primary', msg);
      },
      accent: function (msg) {
        toast('md-accent', msg);
      },
      warn: function (msg) {
        toast('md-warn', msg);
      },
      confirm: function (content) {
        return $mdDialog.show($mdDialog.confirm()
          .parent(angular.element(document.body)).title('확인 메시지').content(content)
          .ok('예').cancel('아니오').ariaLabel('확인') // .targetEvent(ev)
        );
      }
    };
  }
]);

// $httpProvider.interceptors.push('HttpInterceptor');
// 모든 AngularJS Ajax Http 호출을 관리함
services.factory('HttpInterceptor', ['$q', '$rootScope',
  function ($q, $rootScope) {
    return {
      request: function (req) {
        nprogress.start();
        return req || $q.when(req);
      },
      requestError: function (req) {
        return $q.reject(req);
      },
      response: function (res) {
        nprogress.done();
        return res || $q.when(res);
      },
      responseError: function (res) {
        if (res.status === 401) {
          $rootScope.$broadcast('event:loginRequired');
        } else if (res.status === 403) {
          $rootScope.$broadcast('event:permissionRequired');
        } else if (res.status === 400) {
          $rootScope.$broadcast('event:error', res);
        } else if (res.status !== 409) {
          $rootScope.$broadcast('event:error', res);
          console.error(res);
        }

        nprogress.done();
        return $q.reject(res);
      }
    };
  }
]);

// 리소스 공통 설정
services.factory('Resource', ['$resource',
  function ($resource) {
    return function (path, params, actions) {
      var param = params || {};
      var action = angular.extend({
        update: { method: 'PUT' } }, actions);

      param.t = Date.now();

      return $resource('/v/admin/' + path, param, action);
    };
  }
]);

// 사용자 데이터 관리
services.factory('Session', ['$http',
  function ($http) {
    return {
      init: $http.get('/session'),
      isLogin: false,
      user: {},
      search: {},
      set: function (data) {
        if (!data) {
          return false;
        }

        this.isLogin = true;
        this.user = data;

        return data;
      },
      destory: function () {
        this.isLogin = false;
        this.user = {};
      },
      logout: function () {
        return $http.get('/v/user/logout');
      }
    };
  }
]);
