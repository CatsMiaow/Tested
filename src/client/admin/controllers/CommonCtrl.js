export default class Common {
  constructor($scope, $window, $location, $filter, $mdSidenav, Alert, Session, menu) {
    angular.extend(this, { $window, $mdSidenav, Session });

    this.menu = menu.nav; // 메뉴

    /* <$on> */
    // 라우트 에러 처리
    $scope.$on('$routeChangeError', (event, current, previous, rejection) => {
      switch (rejection) {
        case 'accessDenied': $scope.$broadcast('event:permissionRequired'); break;
        // no default
      }
    });
    // 접근 권한 이벤트
    $scope.$on('event:permissionRequired', () => {
      Session.destory();
      $window.location.href = '/';
    });
    // 오류 처리
    $scope.$on('event:error', (event, err) => {
      Alert.warn(err.data || `Error: ${err.status} ${err.statusText}`);
    });
    // $scope.$on('$viewContentLoaded', () => {});
    // $scope.$on('$routeChangeStart', (event, current, previous) => {});
    $scope.$on('$locationChangeStart', () => { // event, next, current
      const path = { page: $location.path().split('/').slice(1, 2).join('/') || 'admin' };
      let page = $filter('filter')(menu.nav, path, true)[0];

      $mdSidenav('left').close(); // 메뉴바 닫기
      if (!page) { // 메뉴에 없으면 페이지에서 찾기
        page = $filter('filter')(menu.page, path, true)[0] || {};
      }

      this.title = page.title;
    });
    /* </$on> */
  }
  // 로그아웃
  logout() {
    this.Session.logout().success(() => {
      this.Session.destory();
      this.$window.location.href = '/';
    });
  }
  // 왼쪽메뉴
  toggleSidenav() {
    this.$mdSidenav('left').toggle();
  }
}
Common.$inject = ['$scope', '$window', '$location', '$filter', '$mdSidenav',
  'Alert', 'Session', 'menu'];
