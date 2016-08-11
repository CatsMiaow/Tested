export default function hooks(
  $httpProvider, $locationProvider, $routeProvider, $animateProvider, $mdThemingProvider) {
  let isInit = false;
  /* .when 커스텀: 인증 리솔브 추가, 페이지 접근 전에 인증 검사
  * 인증 실패 시 기존 리솔브를 실행하지 않기 위해 커스텀 안에서 처리
  */
  $routeProvider.whenAuth = (path, route) => {
    const resolve = route.resolve; // 기존 리솔브

    route.resolve = { // 커스텀으로 대체
      initData: ['$q', '$injector', '$rootScope', 'Session',
        ($q, $injector, $rootScope, Session) => {
          const delay = $q.defer();
          const init = isInit || Session.init;

          // 최초 접근 시 사용자 데이터를 가져옴
          $q.when(init).then(user => {
            const locals = {};

            if (!isInit) { // 최초 한번 세팅
              isInit = true;

              Session.set(user.data);
              $rootScope.$watch(() => Session, () => { // 로그인 상태 감지
                $rootScope.isLogin = Session.isLogin;
              }, true);
            }

            // $routeChangeError 처리
            if (route.guest && Session.isLogin) { // 비회원 전용
              delay.reject('guestOnly');
            } else if (route.auth && !Session.isLogin) { // 회원 전용
              delay.reject('loginRequired');
            } else { // 기존 리솔브를 데이터로 반환
              angular.forEach(resolve, (value, key) => {
                locals[key] = $injector.invoke(value, null, null, key);
              });

              $q.all(locals).then(response => {
                delay.resolve(response);
              });
            }
          });

          return delay.promise;
        },
      ],
    };

    return $routeProvider.when(path, route);
  };

  // 전역 요청/응답 캐치
  $httpProvider.interceptors.push('httpInterceptor');
  // DEPRECATED: $httpProvider.responseInterceptors.push('ErrorHttpInterceptor');

  // 요청 헤더 변경
  // $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  // $httpProvider.defaults.headers.common['Authentication'] = 'Key';

  // 요청/응답 데이터 가공
  // $httpProvider.defaults.transformRequest
  // $httpProvider.defaults.transformResponse

  $locationProvider.html5Mode(true); // .hashPrefix('!');

  // 애니메이션 적용 클래스 필터링
  // $animateProvider.classNameFilter(/.*-animate/);

  // Material Default Theme Custom
  $mdThemingProvider.theme('default')
    .primaryPalette('teal')
    .accentPalette('indigo')
    .warnPalette('pink')
    .backgroundPalette('grey');
}
hooks.$inject = [
  '$httpProvider', '$locationProvider', '$routeProvider', '$animateProvider', '$mdThemingProvider'];
