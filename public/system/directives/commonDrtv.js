'use strict';

var directives = require('./_directives');

// 뒤로가기
directives.directive('goBack', ['$window', function($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('click', function () {
                $window.history.back();
            });
        }
    };
}]);

// Enter 입력 이벤트
directives.directive('ngEnter', [function() {
    return {
        link: function (scope, element, attrs) {
            element.bind('keydown keypress', function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter);
                    });
                    
                    event.preventDefault();
                }
            });
        }
    };
}]);

// 포커스 이벤트
directives.directive('focus', ['$parse', '$timeout',
    function($parse, $timeout) {
        return {
            restrict: 'A',
            scope: true,
            link: function(scope, element, attrs) {
                scope.$watch(attrs.focus, function(newValue, oldValue) {
                    if (angular.isUndefined(newValue)) { return false; }
                    $timeout(function() {
                        element[0].focus();
                    });
                });
            }
        }
    }
]);
