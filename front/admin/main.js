'use strict';

var nprogress = require('nprogress');
var angular = require('angular'); // global
var app = require('./app');

nprogress.start();
require('tinymce'); // global
require('./routes')(app);

// Configs
require('./configs/menuCfg');
// Filters
//
// Directives
require('./directives/commonDrtv');
require('./directives/formDrtv');
require('./directives/tinymceDrtv');
// Services
require('./services/CommonSvc');
require('./services/UserSvc');
require('./services/BoardSvc');
// Controllers
require('./controllers/CommonCtrl');
require('./controllers/MainCtrl');
require('./controllers/UserCtrl');
require('./controllers/BoardCtrl');

angular.element(document).ready(function () {
  angular.bootstrap(document, ['Tested-Admin']);
});

app.run(['amMoment', function (amMoment) {
  amMoment.changeLocale('ko');
  angular.element(document.querySelector('#container')).css('visibility', 'visible');
  nprogress.done();
}]);
