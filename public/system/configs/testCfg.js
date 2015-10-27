'use strict';

var configs = require('./_configs');

configs.constant('test1', { // 수정 불가
    test1: 'test1',
    test2: 'test2'
});

configs.value('test2', { // 수정 가능
    test1: true,
    test2: false
});