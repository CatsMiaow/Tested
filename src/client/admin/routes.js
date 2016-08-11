export default function routes($routeProvider) {
  $routeProvider
    .whenAuth('/', {
      controller: 'Main',
      controllerAs: 'vm',
      templateUrl: '/views/admin/main' })
    .whenAuth('/board', {
      controller: 'BoardList',
      controllerAs: 'vm',
      templateUrl: '/views/admin/boardList',
      resolve: { board: ['Board', Board => Board.list()] } })
    .whenAuth('/board/:id?', {
      controller: 'BoardWrite',
      controllerAs: 'vm',
      templateUrl: '/views/admin/boardWrite',
      resolve: { board: ['Board', Board => Board.write()] } })
    .whenAuth('/user', {
      controller: 'UserList',
      controllerAs: 'vm',
      templateUrl: '/views/admin/userList',
      resolve: { user: ['User', User => User.list()] } })
    .whenAuth('/user/:id?', {
      controller: 'UserView',
      controllerAs: 'vm',
      templateUrl: '/views/admin/userView',
      resolve: { user: ['User', User => User.view()] } })
    .otherwise({
      redirectTo: '/' });
}
routes.$inject = ['$routeProvider'];
