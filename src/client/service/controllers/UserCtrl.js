const joinError = { DuplicatedId: '_id', DuplicatedNickname: 'nickname', DuplicatedEmail: 'email' };
const loginError = {
  Invalid: '아이디 또는 비밀번호가 잘못되었습니다. 다시 확인하세요.',
  AttemptsExceeded: '로그인 최대 시도 횟수를 초과하여 로그인할 수 없습니다. 나중에 다시 시도하세요.' };

// 가입
export class Join {
  constructor($location, Alert, User) {
    angular.extend(this, { $location, Alert });

    this.user = new User.Rest();
  }

  save() {
    this.user.$save(() => {
      this.Alert.accent('회원 가입이 완료되었습니다. 로그인하세요.');
      this.$location.path('/user/login');
    }, err => {
      this.form[joinError[err]].$setValidity('unique', false);
    });
  }
}
Join.$inject = ['$location', 'Alert', 'User'];

// 정보수정
export class Modify {
  constructor($location, Session, Alert, initData) {
    angular.extend(this, { $location, Session, Alert });

    this.user = initData.user;
  }

  save() {
    this.user.$update(() => {
      this.Alert.accent('회원 정보가 수정되었습니다. 다시 로그인하세요.');
      this.Session.destory();
      this.$location.path('/user/login');
    }, err => {
      this.form[joinError[err]].$setValidity('unique', false);
    });
  }
}
Modify.$inject = ['$location', 'Session', 'Alert', 'initData'];

// 로그인
export class Login {
  constructor($location, $routeParams, User, Session, Alert) {
    angular.extend(this, { $location, $routeParams, User, Session, Alert });
  }

  login() {
    this.User.login(this.user).then(data => {
      this.Session.set(data);
      this.$location.path(this.$routeParams.url || '/').search({});
    }, err => {
      this.Alert.warn(loginError[err]);
    });
  }
}
Login.$inject = ['$location', '$routeParams', 'User', 'Session', 'Alert'];
