'use strict';

var directives = require('./_directives');

// 뒤로가기
directives.directive('goBack', ['$window', function ($window) {
  return {
    restrict: 'A',
    link: function (scope, element) { // , attrs
      element.bind('click', function () {
        $window.history.back();
      });
    }
  };
}]);

// Enter 입력 이벤트
directives.directive('ngEnter', [function () {
  return {
    link: function (scope, element, attrs) {
      element.bind('keydown keypress', function (event) {
        if (event.which === 13) {
          scope.$apply(function () {
            scope.$eval(attrs.ngEnter);
          });

          event.preventDefault();
        }
      });
    }
  };
}]);

// 포커스 이벤트
directives.directive('focus', ['$timeout',
  function ($timeout) {
    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attrs) {
        scope.$watch(attrs.focus, function (newValue) { // , oldValue
          if (angular.isUndefined(newValue)) {
            return false;
          }

          return $timeout(function () {
            element[0].focus();
          });
        });
      }
    };
  }
]);

// 페이징
directives.component('pagination', {
  bindings: {
    page: '=',
    changed: '&'
  },
  templateUrl: '/views/directive/pagination',
  controller: function () {
    var ctrl = this;

    ctrl.paging = function (no) {
      var page = no;

      if (!page) { // first
        page = 1;
      } else if (page < 2) { // prev, next
        page = parseInt(ctrl.page.current, 10) + page;
      }

      ctrl.changed({
        page: page }); // pageChanged(page)
    };
  }
});
