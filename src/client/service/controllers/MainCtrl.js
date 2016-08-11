export default class Main {
  constructor($location, initData) {
    angular.extend(this, { $location });

    this.notice = initData.latest.notice;
    this.talk = initData.latest.talk;
    this.comment = initData.latest.comment;
  }

  viewDetail(board, id, co) {
    if (co) {
      this.$location.hash(`c${co}`);
    }

    this.$location.path(`board/${board}/view/${id}`);
  }
}
Main.$inject = ['$location', 'initData'];
