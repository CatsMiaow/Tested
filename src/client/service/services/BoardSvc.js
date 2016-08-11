export default class Board {
  constructor(Resource, $route, $q, Session) {
    angular.extend(this, { $route, $q, Session });

    this.Rest = Resource('board/:boardId/:writeMode/:writeId/:commentId:controller', {
      boardId: '@boardId',
      writeMode: '@writeMode',
      writeId: '@writeId',
      commentId: '@commentId',
      controller: '@controller',
    }, {
      colist: { method: 'GET', params: { controller: 'colist' } },
    });
  }

  list({
    boardId = this.$route.current.params.boardId, search = this.Session.search[boardId] || {},
    page = search.page, stx = search.text,
  } = {}) {
    const delay = this.$q.defer();

    this.Rest.get({ boardId, page, stx }, result => {
      delay.resolve(result);
    }, err => {
      delay.reject(err);
    });

    return delay.promise;
  }

  write(writeMode) {
    const delay = this.$q.defer();
    const writeId = this.$route.current.params.writeId;

    this.Rest.get({
      boardId: this.$route.current.params.boardId,
      writeId: writeId || 0,
      writeMode: writeMode || (writeId ? 'u' : 'w'),
    }, result => {
      delay.resolve(result);
    }, err => {
      delay.reject(err);
    });

    return delay.promise;
  }

  initComment() {
    return new this.Rest({
      boardId: this.$route.current.params.boardId,
      writeId: this.$route.current.params.writeId,
      writeMode: 'c',
    });
  }

  listComment({ page }) {
    const delay = this.$q.defer();

    this.Rest.colist({
      boardId: this.$route.current.params.boardId,
      writeId: this.$route.current.params.writeId,
      writeMode: 'r',
      page,
    }, result => {
      delay.resolve(result);
    }, err => {
      delay.reject(err);
    });

    return delay.promise;
  }
}
Board.$inject = ['Resource', '$route', '$q', 'Session'];
