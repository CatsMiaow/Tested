// 비밀번호 매칭 등...
export function inputMatch() {
  return {
    require: 'ngModel',
    restrict: 'A',
    scope: {
      inputMatch: '=',
    },
    link(scope, element, attrs, ctrl) {
      scope.$watch(() => (
          ctrl.$pristine && angular.isUndefined(ctrl.$viewValue)
        ) || scope.inputMatch === ctrl.$viewValue, currentValue => {
        ctrl.$setValidity('match', currentValue);
      });
    },
  };
}

// 커스텀 검사 설정 초기화
export function checker() {
  return {
    require: ['^form', 'ngModel'],
    restrict: 'A',
    scope: {
      checker: '@',
    },
    link(scope, element, attrs, ctrl) {
      const model = ctrl[1];
      // 다른 입력이 있을 때
      model.$parsers.unshift(viewValue => {
        // 설정된 검사를 초기화
        if (model.$error[scope.checker]) {
          model.$setValidity(scope.checker, true);
        }
        return viewValue;
      });
    },
  };
}
