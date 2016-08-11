const writeError = { DuplicatedId: '_id' };

// 목록
export class List {
  constructor($location, Board, initData) {
    angular.extend(this, { $location, Board });

    const board = initData.board;

    this.total = this.orderNo = board.count;
    this.list = board.list;
    this.page = board.page;
  }

  boardDetail(id) {
    this.$location.path(`board/${id}`);
  }

  pageChanged(page = 1) {
    this.Board.list({ page }).then(data => {
      this.list = data.list;
      this.orderNo = data.orderNo;
      this.page = data.page;
    });
  }
}
List.$inject = ['$location', 'Board', 'initData'];

// 작성
export class Write {
  constructor($location, Alert, Board, initData) {
    angular.extend(this, { $location, Alert });

    this.board = initData.board || new Board.Rest();
  }

  save() {
    if (this.board.isNew) { // 등록
      this.board.$save(data => {
        this.Alert.accent(`${data.id} 게시판이 등록되었습니다.`);
        this.$location.path('/board');
      }, err => {
        this.form[writeError[err]].$setValidity('unique', false);
      });
    } else { // 수정
      this.board.$update(data => {
        this.Alert.accent(`${data.id} 게시판이 수정되었습니다.`);
        this.$location.path('/board');
      });
    }
  }
  // 레벨 증가값
  range(min, max) {
    const input = [];

    for (let i = min; i <= max; i++) {
      input.push(i);
    }

    return input;
  }
}
Write.$inject = ['$location', 'Alert', 'Board', 'initData'];
