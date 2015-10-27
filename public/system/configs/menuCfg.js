'use strict';

var configs = require('./_configs');

configs.constant('menu', {
    nav: [{
        page: '/',
        title: '테스티드',
        icon: 'home'
    }, {
        page: '/board/notice',
        title: '공지사항',
        icon: 'sticky-note'
    }, {
        page: '/board/talk',
        title: '자유게시판',
        icon: 'sticky-note-o'
        // icon: 'fa',
        // alarm: 'model',
        // divider: true
    }],
    page: [{
        page: '/user/login',
        title: '로그인'
    }, {
        page: '/user/join',
        title: '회원가입'
    }, {
        page: '/user/modify',
        title: '정보수정'
    }]
});