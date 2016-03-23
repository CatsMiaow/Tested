'use strict';

var directives = require('./_directives');

// 비밀번호 매칭 등...
directives.directive('inputMatch', [function () {
  return {
    require: 'ngModel',
    restrict: 'A',
    scope: {
      inputMatch: '='
    },
    link: function (scope, element, attrs, ctrl) {
      scope.$watch(function () {
        return (
          ctrl.$pristine && angular.isUndefined(ctrl.$viewValue)
        ) || scope.inputMatch === ctrl.$viewValue;
      }, function (currentValue) {
        ctrl.$setValidity('match', currentValue);
      });
    }
  };
}]);

// 커스텀 검사 설정 초기화
directives.directive('checker', [function () {
  return {
    require: ['^form', 'ngModel'],
    restrict: 'A',
    scope: {
      checker: '@'
    },
    link: function (scope, element, attrs, ctrl) {
      var model = ctrl[1];
      // 다른 입력이 있을 때
      model.$parsers.unshift(function (viewValue) {
        // 설정된 검사를 초기화
        if (model.$error[scope.checker]) {
          model.$setValidity(scope.checker, true);
        }
        return viewValue;
      });
    }
  };
}]);
