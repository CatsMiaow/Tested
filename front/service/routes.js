'use strict';

module.exports = function (app) {
  return app.config(['$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .whenAuth('/', {
          controller: 'MainCtrl',
          templateUrl: '/views/main',
          resolve: { latest: ['$q', 'Latest', function ($q, Latest) {
            return $q.all({
              notice: Latest.query({ type: 'write', id: 'notice' }),
              talk: Latest.query({ type: 'write', id: 'talk' }),
              comment: Latest.query({ type: 'comment', limit: 10 })
            });
          }] }
        }).whenAuth('/user/login', {
          controller: 'UserLoginCtrl',
          templateUrl: '/views/user/login',
          guest: true
        }).whenAuth('/user/join', {
          controller: 'UserJoinCtrl',
          templateUrl: '/views/user/join',
          guest: true
        }).whenAuth('/user/modify', {
          controller: 'UserModifyCtrl',
          templateUrl: '/views/user/join',
          resolve: { user: ['User', function (User) {
            return User.get();
          }] },
          auth: true
        }).whenAuth('/board/:boardId', {
          controller: 'BoardListCtrl',
          templateUrl: '/views/board/list',
          resolve: { board: ['Board', function (Board) {
            return Board.list();
          }] }
        }).whenAuth('/board/:boardId/write/:writeId?', {
          controller: 'BoardWriteCtrl',
          templateUrl: '/views/board/write',
          resolve: { write: ['Board', function (Board) {
            return Board.write();
          }] },
          auth: true
        }).whenAuth('/board/:boardId/view/:writeId', {
          controller: 'BoardViewCtrl',
          templateUrl: '/views/board/view',
          resolve: { view: ['Board', function (Board) {
            return Board.write('r');
          }] }
        }).otherwise({
          redirectTo: '/'
        });
    }
  ]);
};
