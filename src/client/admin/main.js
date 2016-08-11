import nprogress from 'nprogress';
import angular from 'angular';

import app from './app';

nprogress.start();

angular.element(document).ready(() => {
  angular.bootstrap(document, ['Tested-Admin']);
});

app.run(['amMoment', amMoment => {
  amMoment.changeLocale('ko');
  angular.element(document.querySelector('#container')).css('visibility', 'visible');
  nprogress.done();
}]);
