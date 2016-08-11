export default class Common {
  constructor($scope, $location, $filter, $mdSidenav,
    Alert, Socket, User, Session, menu, uiTinymceConfig) {
    angular.extend(this, { $location, $mdSidenav, User, Session });

    // TinyMCE Config
    angular.extend(uiTinymceConfig, {
      baseUrl: '/vendor/tinymce',
      content_css: '/css/tinymce.css',
      language_url: '/langs/ko.js',
      plugins: 'autolink autosave code link media table textcolor autoresize',
      menubar: false,
      height: 400,
      resize: false,
      autoresize_min_height: 400,
      autoresize_max_height: 800,
      toolbar: 'undo redo '
        + '| styleselect '
        + '| forecolor bold italic '
        + '| alignleft aligncenter alignright alignjustify '
        + '| bullist numlist outdent indent '
        + '| link media table code',
      relative_urls: false,
    });

    this.menu = menu.nav; // 메뉴

    /* <$on> */
    // 라우트 에러 처리
    $scope.$on('$routeChangeError', (event, current, previous, rejection) => {
      switch (rejection) {
        case 'guestOnly': $scope.$broadcast('event:permissionRequired'); break;
        case 'loginRequired': $scope.$broadcast('event:loginRequired'); break;
        // no default
      }
    });
    // 로그인 필요 이벤트
    $scope.$on('event:loginRequired', () => {
      const returnUrl = $location.url();
      Session.destory(); // 세션이 풀려서 이벤트가 발생했을 때
      Alert.warn('로그인이 필요한 서비스입니다.');
      $location.path('/user/login').search({ url: returnUrl });
    });
    // 접근 권한 이벤트
    $scope.$on('event:permissionRequired', () => {
      Alert.warn('접근 권한이 없습니다.');
      $location.path('/').search({});
    });
    // 오류 처리
    $scope.$on('event:error', (event, err) => {
      Alert.warn(err.data || `Error: ${err.status} ${err.statusText}`);
    });
    // $scope.$on('$viewContentLoaded', () => {});
    // $scope.$on('$routeChangeStart', (event, current, previous) => {});
    $scope.$on('$locationChangeStart', () => { // event, next, current
      const path = { page: $location.path().split('/').slice(0, 3).join('/') || '/' };
      let page = $filter('filter')(menu.nav, path, true)[0];

      $mdSidenav('left').close(); // 메뉴바 닫기
      if (!page) { // 메뉴에 없으면 페이지에서 찾기
        page = $filter('filter')(menu.page, path, true)[0] || {};
      }

      this.title = page.title;
    });
    /* </$on> */

    /* <Socket> */
    // 현재 접속자
    Socket.on('user:count', data => {
      this.userCount = data;
    });
    /* </Socket> */
  }
  // 로그아웃
  logout() {
    this.User.logout().then(() => {
      this.Session.destory();
      this.$location.path('/');
    });
  }
  // 왼쪽메뉴
  toggleSidenav() {
    this.$mdSidenav('left').toggle();
  }
}
Common.$inject = ['$scope', '$location', '$filter', '$mdSidenav',
  'Alert', 'Socket', 'User', 'Session', 'menu', 'uiTinymceConfig'];
