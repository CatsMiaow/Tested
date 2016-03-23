'use strict';

var configs = require('./_configs');

configs.constant('menu', {
  nav: [{
    page: 'admin',
    title: '관리자',
    icon: 'home'
  }, {
    page: 'board',
    title: '게시판',
    icon: 'archive'
  }, {
    page: 'user',
    title: '사용자',
    icon: 'users'
    // divider: true
  }],
  page: []
});
