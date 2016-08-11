export default class Latest {
  constructor(Resource, $route, $q) {
    angular.extend(this, { $route, $q });

    this.Rest = Resource('latest/:type/:id/:controller', {
      type: '@type',
      id: '@id',
      controller: '@controller',
    });
  }

  query({ type, id, limit = 5 }) {
    const delay = this.$q.defer();

    this.Rest.query({ type, id, limit }, result => {
      delay.resolve(result);
    }, err => {
      delay.reject(err);
    });

    return delay.promise;
  }
}
Latest.$inject = ['Resource', '$route', '$q'];
