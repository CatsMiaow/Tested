export default class Board {
  constructor(Resource, $route, $q, Session) {
    angular.extend(this, { $route, $q, Session });

    this.Rest = Resource('board/:id/:controller', {
      id: '@_id',
      controller: '@controller' });
  }

  list({
    id = this.$route.current.params.id, search = this.Session.search['admin-board'] || {},
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

  write() {
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
Board.$inject = ['Resource', '$route', '$q', 'Session'];
