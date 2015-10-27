'use strict';

var nprogress = require('nprogress')
  , io = require('socket.io-client');
var services = require('./_services');

// 에러메시지 관리
services.factory('Alert', ['$mdToast', '$mdDialog',
    function($mdToast, $mdDialog) {
        var toast = function(type, message) {
            $mdToast.show({
                templateUrl: '/views/directive/mdToast',
                position: 'top',
                locals: { type: type, message: message },
                controller: ['scope', 'type', 'message',
                    function(scope, type, message) {
                        scope.type = type;
                        scope.message = message;
                        scope.close = function() {
                            $mdToast.hide();
                        };
                    }
                ]
            });
        };

        return {
            info: function(message) {
                toast('', message);
            },
            accent: function(message) {
                toast('md-accent', message);
            },
            warn: function(message) {
                toast('md-warn', message);
            },
            confirm: function(content) {
                return $mdDialog.show($mdDialog.confirm()
                        .parent(angular.element(document.body)).title('확인 메시지').content(content)
                        .ok('예').cancel('아니오').ariaLabel('확인')//.targetEvent(ev)
                );
            }
        };
    }
]);

// $httpProvider.interceptors.push('HttpInterceptor');
// 모든 AngularJS Ajax Http 호출을 관리함
services.factory('HttpInterceptor', ['$q', '$rootScope',
    function($q, $rootScope) {
        return {
            'request': function(req) {
                nprogress.start();
                return req || $q.when(req);
            },
            'requestError': function(req) {
                return $q.reject(req);
            },
            'response': function(res) {
                nprogress.done();
                return res || $q.when(res);
            },
            'responseError': function(res) {
                if (res.status === 401) {
                    $rootScope.$broadcast('event:loginRequired');
                } else if (res.status === 403) {
                    $rootScope.$broadcast('event:permissionRequired');
                } else if (res.status === 400) {
                    $rootScope.$broadcast('event:error', res);
                } else if (res.status !== 409) {
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
    function($resource) {
        return function(path, params, actions) {
            var params =  params || {};
                params.t = Date.now();

            var actions = angular.extend({
                update: { method: 'PUT' }
            }, actions);

            return $resource('/v/' + path, params, actions);
        }
    }
]);

// 사용자 데이터 관리
services.factory('Session', ['$http',
    function($http) {
        var guest = { id:null, level:1, name:'Guest', email:'@' };

        return {
            init: $http.get('/session'),
            isLogin: false,
            user: {},
            search: {},
            set: function(data) {
                if (!data) { return false; }
                this.isLogin = true;
                this.user = data;
            },
            destory: function() {
                this.isLogin = false;
                this.user = guest;
            }
        };
    }
]);

// Socket.IO
services.factory('Socket', ['$rootScope',
    function($rootScope) {
        var socket = io({
            transports: ['websocket']
        });
        
        return {
            on: function(eventName, callback) {
                socket.on(eventName, function() {
                    var args = arguments;

                    $rootScope.$apply(function() {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function(eventName, data, callback) {
                socket.emit(eventName, data, function() {
                    var args = arguments;

                    $rootScope.$apply(function() {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            }
        };
    }
]);
