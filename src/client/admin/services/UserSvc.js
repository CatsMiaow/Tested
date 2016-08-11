export default class User {
  constructor(Resource, $route, $q, Session) {
    angular.extend(this, { $route, $q, Session });

    this.Rest = Resource('user/:id/:controller', {
      id: '@_id',
      controller: '@controller' });
  }

  list({
    id = this.$route.current.params.id, search = this.Session.search['admin-user'] || {},
    page = search.page, stx = search.text,
  } = {}) {
    const delay = this.$q.defer();

    this.Rest.get({ id, page, stx }, result => {
      delay.resolve(result);
    }, err => {
      delay.reject(err);
    });

    return delay.promise;
  }

  view() {
    const delay = this.$q.defer();

    this.Rest.get({
      id: this.$route.current.params.id,
    }, result => {
      delay.resolve(result);
    }, err => {
      delay.reject(err);
    });

    return delay.promise;
  }
}
User.$inject = ['Resource', '$route', '$q', 'Session'];
