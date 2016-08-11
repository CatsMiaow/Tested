export default function routes($routeProvider) {
  $routeProvider
    .whenAuth('/', {
      controller: 'Main',
      controllerAs: 'vm',
      templateUrl: '/views/main',
      resolve: { latest: ['$q', 'Latest', ($q, Latest) => $q.all({
        notice: Latest.query({ type: 'write', id: 'notice' }),
        talk: Latest.query({ type: 'write', id: 'talk' }),
        comment: Latest.query({ type: 'comment', limit: 10 }) })] } })
    .whenAuth('/user/login', {
      controller: 'UserLogin',
      controllerAs: 'vm',
      templateUrl: '/views/user/login',
      guest: true })
    .whenAuth('/user/join', {
      controller: 'UserJoin',
      controllerAs: 'vm',
      templateUrl: '/views/user/join',
      guest: true })
    .whenAuth('/user/modify', {
      controller: 'UserModify',
      controllerAs: 'vm',
      templateUrl: '/views/user/join',
      resolve: { user: ['User', User => User.get()] },
      auth: true })
    .whenAuth('/board/:boardId', {
      controller: 'BoardList',
      controllerAs: 'vm',
      templateUrl: '/views/board/list',
      resolve: { board: ['Board', Board => Board.list()] } })
    .whenAuth('/board/:boardId/write/:writeId?', {
      controller: 'BoardWrite',
      controllerAs: 'vm',
      templateUrl: '/views/board/write',
      resolve: { write: ['Board', Board => Board.write()] },
      auth: true })
    .whenAuth('/board/:boardId/view/:writeId', {
      controller: 'BoardView',
      controllerAs: 'vm',
      templateUrl: '/views/board/view',
      resolve: { view: ['Board', Board => Board.write('r')] } })
    .otherwise({
      redirectTo: '/' });
}
routes.$inject = ['$routeProvider'];
