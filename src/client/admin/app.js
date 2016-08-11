import 'angular-route';
import 'angular-resource';
import 'angular-sanitize';
import 'angular-cookies';
import 'angular-animate';
import 'angular-aria';
import 'angular-messages';
import 'angular-material';
import 'ng-file-upload';
import 'angular-moment';

import hooks from './hooks';
import routes from './routes';
import './configs/_configs';
import './controllers/_controllers';
import './services/_services';
import './filters/_filters';
import './directives/_directives';

module.exports = angular.module('Tested-Admin', [
  'ngRoute', 'ngResource', 'ngSanitize', 'ngCookies', 'ngAnimate', 'ngAria', 'ngMessages',
  'ngMaterial', 'ngFileUpload', 'angularMoment',
  'configs', 'controllers', 'services', 'filters', 'directives',
]).config(hooks)
  .config(routes);
