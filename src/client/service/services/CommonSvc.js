import nprogress from 'nprogress';
import io from 'socket.io-client';

// $httpProvider.interceptors.push('httpInterceptor');
// 모든 AngularJS Ajax Http 호출을 관리함
export function httpInterceptor($q, $rootScope) {
  return {
    request(req) {
      nprogress.start();
      return req || $q.when(req);
    },
    requestError(req) {
      return $q.reject(req);
    },
    response(res) {
      nprogress.done();
      return res || $q.when(res);
    },
    responseError(res) {
      let reject = res;

      if (res.status === 401) {
        $rootScope.$broadcast('event:loginRequired');
      } else if (res.status === 403) {
        $rootScope.$broadcast('event:permissionRequired');
      } else if (res.status === 400) {
        reject = res.data.message;
      } else {
        $rootScope.$broadcast('event:error', res);
        console.error(res);
      }

      nprogress.done();
      return $q.reject(reject);
    },
  };
}
httpInterceptor.$inject = ['$q', '$rootScope'];

// 에러메시지 관리
export class Alert {
  constructor($mdToast, $mdDialog) {
    angular.extend(this, { $mdDialog });

    this.toast = (style, message) => {
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .action('x')
          .highlightAction(true)
          .highlightClass(style)
          .position('top'));
    };
  }

  info(message) {
    this.toast('md-primary', message);
  }

  accent(message) {
    this.toast('md-accent', message);
  }

  warn(message) {
    this.toast('md-warn', message);
  }

  confirm(message) {
    return this.$mdDialog.show(
      this.$mdDialog.confirm()
        .parent(angular.element(document.body))
        .title('확인 메시지').htmlContent(message)
        .ok('예')
        .cancel('아니오')
        .ariaLabel('확인')); // .targetEvent(ev)
  }
}
Alert.$inject = ['$mdToast', '$mdDialog'];

// 리소스 공통 설정
export class Resource {
  constructor($resource) {
    return (path, params = {}, actions = {}) => {
      actions.update = { method: 'PUT' };
      params.t = Date.now();

      return $resource(`/v/${path}`, params, actions);
    };
  }
}
Resource.$inject = ['$resource'];

// 사용자 데이터 관리
export class Session {
  constructor($http) {
    this.guest = { id: null, level: 1, name: 'Guest', email: '@' };
    this.init = $http.get('/session');
    this.isLogin = false;
    this.user = {};
    this.search = {};
  }

  set(data) {
    if (!data) {
      return false;
    }
    this.isLogin = true;
    this.user = data;
    return data;
  }

  destory() {
    this.isLogin = false;
    this.user = this.guest;
  }
}
Session.$inject = ['$http'];

// Socket.IO
export class Socket {
  constructor($rootScope) {
    angular.extend(this, { $rootScope });

    this.socket = io({ transports: ['websocket'] });
  }

  on(eventName, callback) {
    this.socket.on(eventName, (...args) => {
      this.$rootScope.$apply(() => {
        callback.apply(this.socket, args);
      });
    });
  }

  emit(eventName, data, callback) {
    this.socket.emit(eventName, data, (...args) => {
      this.$rootScope.$apply(() => {
        if (callback) {
          callback.apply(this.socket, args);
        }
      });
    });
  }
}
Socket.$inject = ['$rootScope'];
