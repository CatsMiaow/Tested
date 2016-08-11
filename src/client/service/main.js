import nprogress from 'nprogress';
import angular from 'angular';
import 'tinymce/tinymce';

import app from './app';

nprogress.start();

angular.element(document).ready(() => {
  angular.bootstrap(document, ['Tested']);
});

app.run(['amMoment', 'Socket', 'Alert', (amMoment, Socket, Alert) => {
  Socket.on('connect', () => {
    // Alert.accent('서버에 접속되었습니다.');
  });
  Socket.on('reconnect', () => {
    Alert.info('서버에 재접속되었습니다.');
  });
  Socket.on('reconnecting', () => {
    Alert.warn('서버에 재접속을 시도 중입니다.');
  });
  Socket.on('error', e => {
    Alert.warn(e || 'A unknown error occurred');
  });
  Socket.on('disconnect', () => { // e
    // Alert.warn('서버 연결이 종료되었습니다.');
  });

  amMoment.changeLocale('ko');
  angular.element(document.querySelector('#container')).css('visibility', 'visible');
  nprogress.done();
}]);
