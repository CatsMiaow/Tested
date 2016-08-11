// 목록
export class List {
  constructor($location, User, initData) {
    angular.extend(this, { $location, User });

    const user = initData.user;

    this.total = this.orderNo = user.count;
    this.list = user.list;
    this.page = user.page;
  }

  userDetail(id) {
    this.$location.path(`user/${id}`);
  }

  pageChanged(page = 1) {
    this.User.list({ page }).then(data => {
      this.list = data.list;
      this.orderNo = data.orderNo;
      this.page = data.page;
    });
  }
}
List.$inject = ['$location', 'User', 'initData'];

// 보기
export class View {
  constructor(initData) {
    this.user = initData.user;
  }
}
View.$inject = ['initData'];
