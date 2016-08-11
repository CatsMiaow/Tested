// 목록
export class List {
  constructor($location, Board, initData, Session) {
    angular.extend(this, { $location, Board, Session });

    const board = initData.board;

    this.boardId = board.boardId;
    this.skin = `/views/board/${board.skin}/list`;
    this.isWrite = board.isWrite;
    this.total = this.orderNo = board.count;
    this.list = board.list;
    this.page = board.page;
    this.search = Session.search[board.boardId] || {};
  }

  viewDetail(writeId) {
    this.$location.path(`board/${this.boardId}/view/${writeId}`);
  }

  pageChanged(page = 1) {
    this.Board.list({ page, stx: this.search.text }).then(data => {
      this.list = data.list;
      this.orderNo = data.orderNo;
      this.page = data.page;
      this.search.page = data.page.current;
      this.Session.search[this.boardId] = this.search;
    });
  }

  resetSearch() {
    this.search.text = '';
    this.pageChanged(1);
  }
}
List.$inject = ['$location', 'Board', 'initData', 'Session'];

// 작성
export class Write {
  constructor($scope, $window, $location, $http, $timeout, Upload, Alert, Board, initData) {
    angular.extend(this, { $location, $http, $timeout, Upload, Alert });

    const write = initData.write;

    if (write.data) {
      write.boardId = write.data.board;
      write.writeId = write.data._id;
    } else { // 새글
      write.data = new Board.Rest({ boardId: write.boardId });
      write.data.files = [];
    }

    this.write = write;
    this.beforeUnload = true;
    this.skin = `/views/board/${write.skin}/write`;
    this.upload = []; // 업로드 프로세스
    this.progress = []; // 업로드 진행 상태

    // 새로고침 시 페이지 벗어나기 경고
    $window.onbeforeunload = () => {
      if (this.beforeUnload) {
        return '이 페이지를 벗어나면 작성 중인 글이 지워집니다.';
      }

      return false;
    };
    // 페이지 이동 시 벗어나기 경고
    $scope.$on('$locationChangeStart', event => { // , next, current
      if (this.beforeUnload
        && !$window.confirm('이 페이지를 벗어나면 작성 중인 글이 지워집니다.\n\n이 페이지를 벗어나겠습니까?')) {
        event.preventDefault();
      }
    });
  }

  save() {
    const boardId = this.write.boardId;

    this.beforeUnload = false;
    if (this.write.writeId) { // 수정
      this.write.$update(() => {
        this.Alert.accent('게시글이 수정되었습니다.');
        this.$location.path(`/board/${boardId}`);
      });
    } else { // 등록
      this.write.$save(() => {
        this.Alert.accent('게시글이 등록되었습니다.');
        this.$location.path(`/board/${boardId}`);
      });
    }
  }
  // 업로드 취소/삭제
  abort(index, event) {
    event.preventDefault();

    // 업로드가 진행 중인 상태라면
    if (this.upload[index] !== null && this.progress[index] < 100) {
      this.upload[index].abort();
      this.upload[index] = null;
    } else { // 파일 삭제
      const file = this.write.data.files[index];
      const fileSource = file.path + file.name;

      if (!file.created) { // 신규 파일이라면
        // $http.delete는 파라미터를 보낼 수 없음
        this.$http.post('/v/upload/delete', { file: fileSource }).success(() => {
          this.upload.splice(index, 1);
          this.progress.splice(index, 1);
        });
      }

      this.write.data.files.splice(index, 1);
      tinymce.activeEditor.dom.remove(
        tinymce.activeEditor.dom.select(`img[src$="${fileSource}"]`));
      tinymce.activeEditor.focus(); // dom.remove에 change 이벤트가 발생하지 않아서 수동 처리
    }
  }
  // 파일 선택 시
  onFileSelect(files) {
    if (!(files && files.length)) {
      return false;
    }

    /* // 파일을 다시 선택할 때 진행 중인 업로드 모두 취소
    if (this.upload && this.upload.length > 0) {
      for (let i = 0; i < this.upload.length; i++) {
        if (this.upload[i] != null) {
          this.upload[i].abort();
        }
      }
    }*/

    const errorMsg = [];
    const uploadLength = this.write.data.files.length;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const index = uploadLength + i;

      if (!/^image\/(gif|jpe?g|png)$/i.test(file.type)) {
        errorMsg.push(`${file.name}#이미지 파일이 아닙니다.`);
      } else if (file.size > 2048000) {
        errorMsg.push(`${file.name}#파일 크기는 2mb를 초과할 수 없습니다.`);
      } else {
        this.write.data.files.push(file); // 파일정보 등록
        this.progress[index] = -1;
        this.start(index);
      }
    }

    if (errorMsg.length > 0) {
      this.Alert.warn(errorMsg.join('\n'));
    }

    return true;
  }
  // 파일 업로드 시작
  start(index) {
    this.progress[index] = 0;

    this.upload[index] = this.Upload.upload({
      url: '/v/upload/image',
      // fileFormDataName: 'fileField',
      // data: { myData : this.myData },
      file: this.write.data.files[index],
    }).progress(evt => {
      // Math.min is to fix IE which reports 200% sometimes
      this.progress[index] = Math.min(100, parseInt((100.0 * evt.loaded) / evt.total, 10));
    }).success(data => { // , status, headers, config
      this.$timeout(() => {
        this.upload[index] = null;
        this.write.data.files[index] = data;

        // 에디터 이미지 등록
        tinymce.activeEditor.insertContent(
          `<img src="${data.path}${data.name}" alt="${data.orig}" />`);
      });
    }).error((data, status) => { // , headers, config
      if (status > 0) {
        this.Alert.warn(`${status}: ${data}`);
      }
    });
  }

  fileAppend(index, event) {
    const file = this.write.data.files[index];
    event.preventDefault();

    tinymce.activeEditor.insertContent(
      `<img src="${file.path}${file.name}" alt="${file.orig}" />`);
  }
}
Write.$inject = ['$scope', '$window', '$location', '$http', '$timeout',
  'Upload', 'Alert', 'Board', 'initData'];

// 보기
export class View {
  constructor($sce, $location, $anchorScroll, $timeout, Alert, Board, initData) {
    angular.extend(this, { $location, Alert, Board });

    const view = initData.view;
    view.boardId = view.data.board;
    view.writeId = view.data._id;
    view.data.content = $sce.trustAsHtml(view.data.content);

    this.view = view;
    this.skin = `/views/board/${view.skin}/view`;
    this.isOwner = view.isOwner;
    this.isWrite = view.isWrite;
    this.isComment = view.isComment;
    this.coPage = view.coPage;
    this.comment = Board.initComment();

    $timeout(() => { // 댓글 바로가기 #c01
      $anchorScroll();
    }, 500);
  }

  remove() { // 게시글 삭제
    this.Alert.confirm('한번 삭제한 자료는 복구할 수 없습니다.<br/>정말 삭제하시겠습니까?').then(() => {
      const boardId = this.view.boardId;

      this.view.$delete(() => {
        delete this.view.data;
        this.Alert.accent('게시글이 삭제되었습니다.');
        this.$location.path(`/board/${boardId}`);
      });
    });
  }

  saveComment() {
    if (this.comment.commentId) { // 댓글 수정
      this.comment.$update(data => {
        this.view.data.comments[this.actionIndex].content = data.content;
        this.resetComment();
        this.Alert.accent('댓글이 수정되었습니다.');
        this.$location.hash(`c${data._id}`);
      });
    } else { // 댓글 등록
      this.comment.$save(data => {
        data.isOwner = true;
        if (this.actionIndex) { // 답글
          this.view.data.comments.splice(this.actionIndex + 1, 0, data);
        } else {
          this.view.data.comments.push(data);
        }

        this.resetComment();
        this.Alert.accent('댓글이 등록되었습니다.');
        this.$location.hash(`c${data._id}`);
      });
    }
  }

  replyComment(item, index) {
    this.resetComment();
    this.comment.reply = item._id;
    this.action = 'reply';
    this.actionIndex = index;
  }

  modifyComment(item, index) {
    this.comment.commentId = item._id;
    angular.extend(this.comment, item);
    this.action = 'modify';
    this.actionIndex = index;
  }

  resetComment() {
    this.comment = this.Board.initComment();
    this.action = this.actionIndex = null;
  }

  removeComment(item, index) { // 댓글 삭제
    this.Alert.confirm('한번 삭제한 자료는 복구할 수 없습니다.<br/>정말 삭제하시겠습니까?').then(() => {
      this.comment.commentId = item._id;
      this.comment.$delete(() => {
        delete this.comment;
        this.view.data.comments.splice(index, 1);
        this.comment = this.Board.initComment();
        this.Alert.accent('댓글이 삭제되었습니다.');
        this.$location.hash(`c${item._id}`);
      });
    });
  }

  pageChanged(page) {
    this.Board.listComment({ page }).then(data => {
      this.view.data.comments = data.list;
      this.coPage = data.page;
    });
  }
}
View.$inject = ['$sce', '$location', '$anchorScroll', '$timeout',
  'Alert', 'Board', 'initData'];
