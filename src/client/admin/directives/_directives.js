import * as common from './commonDrtv';
import * as form from './formDrtv';


export default angular.module('directives', [])
  .component('pagination', common.pagination)
  .directive('goBack', common.goBack)
  .directive('ngEnter', common.ngEnter)
  .directive('focus', common.focus)
  .directive('inputMatch', form.inputMatch)
  .directive('checker', form.checker);
