// 뒤로가기
export function goBack($window) {
  return {
    restrict: 'A',
    link(scope, element) { // , attrs
      element.bind('click', () => {
        $window.history.back();
      });
    },
  };
}
goBack.$inject = ['$window'];

// Enter 입력 이벤트
export function ngEnter() {
  return {
    link(scope, element, attrs) {
      element.bind('keydown keypress', event => {
        if (event.which === 13) {
          scope.$apply(() => {
            scope.$eval(attrs.ngEnter);
          });

          event.preventDefault();
        }
      });
    },
  };
}

// 포커스 이벤트
export function focus($timeout) {
  return {
    restrict: 'A',
    scope: true,
    link(scope, element, attrs) {
      scope.$watch(attrs.focus, newValue => { // , oldValue
        if (angular.isUndefined(newValue)) {
          return false;
        }

        return $timeout(() => {
          element[0].focus();
        });
      });
    },
  };
}
focus.$inject = ['$timeout'];

// 페이징
export const pagination = {
  bindings: {
    page: '=',
    changed: '&',
  },
  templateUrl: '/views/directive/pagination',
  controller() {
    const ctrl = this;

    ctrl.paging = (no) => {
      let page = no;

      if (!page) {
        page = 1;
      } else if (page < 2) { // prev, next
        page = parseInt(ctrl.page.current, 10) + page;
      }

      ctrl.changed({ page }); // pageChanged(page)
    };
  },
};
