'use strict';

module.exports = function (app) {
  return app.config(['$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .whenAuth('/', {
          controller: 'MainCtrl',
          templateUrl: '/views/admin/main'
        }).whenAuth('/board', {
          controller: 'BoardListCtrl',
          templateUrl: '/views/admin/boardList',
          resolve: { board: ['Board', function (Board) {
            return Board.list();
          }] }
        }).whenAuth('/board/:id?', {
          controller: 'BoardWriteCtrl',
          templateUrl: '/views/admin/boardWrite',
          resolve: { board: ['Board', function (Board) {
            return Board.write();
          }] }
        }).whenAuth('/user', {
          controller: 'UserListCtrl',
          templateUrl: '/views/admin/userList',
          resolve: { user: ['User', function (User) {
            return User.list();
          }] }
        }).whenAuth('/user/:id?', {
          controller: 'UserViewCtrl',
          templateUrl: '/views/admin/userView',
          resolve: { user: ['User', function (User) {
            return User.view();
          }] }
        }).otherwise({
          redirectTo: '/'
        });
    }]);
};
