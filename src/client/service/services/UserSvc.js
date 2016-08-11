export default class User {
  constructor(Resource, $route, $q) {
    angular.extend(this, { $route, $q });

    this.Rest = Resource('user/:controller', {
      controller: '@controller',
    }, {
      login: { method: 'POST', params: { controller: 'login' } },
      logout: { method: 'GET', params: { controller: 'logout' } },
    });
  }

  get() {
    const delay = this.$q.defer();

    this.Rest.get(result => {
      delay.resolve(result);
    }, err => {
      delay.reject(err);
    });

    return delay.promise;
  }

  login({ id, password }) {
    const delay = this.$q.defer();

    this.Rest.login({ id, password }, result => {
      delay.resolve(result);
    }, err => {
      delay.reject(err);
    });

    return delay.promise;
  }

  logout() {
    const delay = this.$q.defer();

    this.Rest.logout(result => {
      delay.resolve(result);
    }, err => {
      delay.reject(err);
    });

    return delay.promise;
  }
}
User.$inject = ['Resource', '$route', '$q'];
