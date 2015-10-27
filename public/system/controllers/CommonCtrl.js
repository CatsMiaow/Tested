'use strict';

var controllers = require('./_controllers');

controllers.controller('CommonCtrl', ['$scope', '$location', '$filter', '$mdSidenav', '$mdBottomSheet', 'Alert', 'Socket', 'User', 'Session', 'menu',
    function($scope, $location, $filter, $mdSidenav, $mdBottomSheet, Alert, Socket, User, Session, menu) {
        /*<$scope>*/
        $scope.menu = menu.nav; // 메뉴

        // 로그아웃
        $scope.logout = function() {
            User.logout().then(function() {
                Session.destory();
                $location.path('/');
            });
        };
        // 하단바
        $scope.showBottomSheet = function($event) {
            $mdBottomSheet.show({
                templateUrl: '/views/directive/mdBottomSheet',
                // controller: 'GridBottomSheetCtrl',
                targetEvent: $event
            }).then(function(clickedItem) {
                //
            });
        };
        // 왼쪽메뉴
        $scope.toggleSidenav = function() {
            $mdSidenav('left').toggle();
        };
        /*</$scope>*/


        /*<$on>*/
        // 라우트 에러 처리
        $scope.$on('$routeChangeError', function(event, current, previous, rejection) {
            switch (rejection) {
                case 'guestOnly': $scope.$broadcast('event:permissionRequired'); break;
                case 'loginRequired': $scope.$broadcast('event:loginRequired'); break;
            }
        });
        // 로그인 필요 이벤트
        $scope.$on('event:loginRequired', function() {
            var returnUrl = $location.url();
            Session.destory(); // 세션이 풀려서 이벤트가 발생했을 때
            Alert.warn('로그인이 필요한 서비스입니다.');
            $location.path('/user/login').search({url: returnUrl});
        });
        // 접근 권한 이벤트
        $scope.$on('event:permissionRequired', function() {
            Alert.warn('접근 권한이 없습니다.');
            $location.path('/').search({});
        });
        // 오류 처리
        $scope.$on('event:error', function(event, err) {
            Alert.warn(err.data || 'Error: '+err.status+' '+err.statusText);
        });
        // $scope.$on('$viewContentLoaded', function() {});
        // $scope.$on('$routeChangeStart', function(event, current, previous) {});
        $scope.$on('$locationChangeStart', function(event, next, current) {
            $mdSidenav('left').close(); // 메뉴바 닫기
            var path = { page: $location.path().split('/').slice(0,3).join('/') };
            var page = $filter('filter')(menu.nav, path, true)[0];
            if (!page) { page = $filter('filter')(menu.page, path, true)[0]; }
            $scope.title = page.title;
        });
        /*</$on>*/


        /*<Socket>*/
        // 현재 접속자
        Socket.on('user:count', function(data) {
            $scope.userCount = data;
        });
        /*</Socket>*/
    }
]);
