'use strict';

var controllers = require('./_controllers');

controllers.controller('BoardListCtrl', ['$scope', '$location', 'Board', 'initData', 'Session',
    function($scope, $location, Board, initData, Session) {
        var board = initData.board;

        $scope.boardId = board.boardId;
        $scope.skin    = '/views/board/'+board.skin+'/list';
        $scope.isWrite = board.isWrite;
        $scope.total   = $scope.orderNo = board.count;
        $scope.list    = board.list;
        $scope.page    = board.page;
        $scope.search  = Session.search[board.boardId] || {};

        $scope.viewDetail = function(writeId) {
            $location.path('board/'+board.boardId+'/view/'+writeId);
        };

        $scope.pageChanged = function(page) {
            if (!page) { // first
                page = 1;
            } else if (page < 2) { // prev, next
                page = parseInt($scope.page.current) + page;
            }

            Board.list({ page: page, search: $scope.search.text }).then(function(data) {
                $scope.list        = data.list;
                $scope.orderNo     = data.orderNo;
                $scope.page        = data.page;
                $scope.search.page = data.page.current;
                Session.search[board.boardId] = $scope.search;
            });
        };

        $scope.resetSearch = function() {
            $scope.search.text = '';
            $scope.pageChanged();
        };
    }
]);

controllers.controller('BoardWriteCtrl', [
    '$scope', '$window', '$location', '$http', '$timeout', 'Upload', 'Alert', 'Board', 'initData',
    function($scope, $window, $location, $http, $timeout, Upload, Alert, Board, initData) {
        var write = initData.write;

        if (write.data) { 
            write.boardId = write.data.board;
            write.writeId = write.data._id;
        } else { // 새글
            write.data = new Board.conn({boardId: write.boardId});
            write.data.files = [];
        }

        var boardId = write.boardId; // 리스트로 가기 위한
        $scope.beforeUnload = true;
        $scope.skin = '/views/board/'+write.skin+'/write';
        $scope.write = write.data;

        $scope.upload   = []; // 업로드 프로세스
        $scope.progress = []; // 업로드 진행 상태

        $scope.save = function() {
            $scope.beforeUnload = false;
            if (write.writeId) { // 수정
                write.$update(function(data) {
                    Alert.accent('게시글이 수정되었습니다.');
                    $location.path('/board/' + boardId);
                });
            } else { // 등록
                write.$save(function(data) {
                    Alert.accent('게시글이 등록되었습니다.');
                    $location.path('/board/' + boardId); // + '/view/' + data.writeId);
                });
            }
        };

        // 업로드 취소/삭제
        $scope.abort = function(index, event) {
            event.preventDefault();
            
            // 업로드가 진행 중인 상태라면
            if ($scope.upload[index] != null && $scope.progress[index] < 100) {
                $scope.upload[index].abort();
                $scope.upload[index] = null;
            } else { // 파일 삭제
                var file = $scope.write.files[index]
                  , fileSource = file.path+file.name;

                if (!file.created) { // 신규 파일이라면
                    // $http.delete는 파라미터를 보낼 수 없음
                    $http.post('/v/upload/delete', { file: fileSource }).success(function() {
                        $scope.upload.splice(index, 1);
                        $scope.progress.splice(index, 1);
                    });
                }

                $scope.write.files.splice(index, 1);
                tinymce.activeEditor.dom.remove(tinymce.activeEditor.dom.select('img[src$="'+fileSource+'"]'));
                tinymce.activeEditor.focus(); // dom.remove에 change 이벤트가 발생하지 않아서 수동 처리
            }
        };
        // 파일 선택 시
        $scope.onFileSelect = function(files) {
            if (!(files && files.length)) {
                return false;
            }

            /*// 파일을 다시 선택할 때 진행 중인 업로드 모두 취소
            if ($scope.upload && $scope.upload.length > 0) {
                for (var i=0; i<$scope.upload.length; i++) {
                    if ($scope.upload[i] != null) {
                        $scope.upload[i].abort();
                    }
                }
            }*/

            var errorMsg = [], uploadLength = $scope.write.files.length;
            for (var i=0; i<files.length; i++) {
                var file = files[i]
                  , index = uploadLength + i;

                if (!/^image\/(gif|jpe?g|png)$/i.test(file.type)) {
                    errorMsg.push(file.name + '#이미지 파일이 아닙니다.');
                    continue;
                }
                if (file.size > 2048000) {
                    errorMsg.push(file.name + '#파일 크기는 2mb를 초과할 수 없습니다.');
                    continue;
                }

                $scope.write.files.push(file); // 파일정보 등록

                /*// 이미지만 임시 주소 추출
                if (file.type.indexOf('image') > -1) {
                    var fileReader = new FileReader(); // HTML5 API
                        fileReader.readAsDataURL(files[i]);

                    var loadFile = function(fileReader, index) {
                        fileReader.onload = function(e) {
                            $timeout(function() { // data:image/jpeg;base64, ...
                                $scope.dataUrls[index] = e.target.result;
                            });
                        }
                    }(fileReader, index);
                }*/

                $scope.progress[index] = -1;
                $scope.start(index);
            }

            if (errorMsg.length > 0) {
                Alert.warn(errorMsg.join("\n"));
            }
        };
        // 파일 업로드 시작
        $scope.start = function(index) {
            $scope.progress[index] = 0;

            $scope.upload[index] = Upload.upload({
                url: '/v/upload/image',
                // fileFormDataName: 'fileField',
                // data: { myData : $scope.myData },
                file: $scope.write.files[index]
            }).progress(function(evt) {
                // Math.min is to fix IE which reports 200% sometimes
                $scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            }).success(function(data, status, headers, config) {
                $timeout(function() {
                    $scope.upload[index] = null;
                    $scope.write.files[index] = data;
                    
                    // 에디터 이미지 등록
                    tinymce.activeEditor.insertContent('<img src="'+data.path+data.name+'" alt="'+data.orig+'" />');
                });
            }).error(function(data, status, headers, config) {
                if (status > 0) { Alert.warn(status + ': ' + data); }
            });
        };
        $scope.fileAppend = function(index, event) {
            event.preventDefault();
            
            var file = $scope.write.files[index];
            tinymce.activeEditor.insertContent('<img src="'+file.path+file.name+'" alt="'+file.orig+'" />');
        };


        // 새로고침 시 페이지 벗어나기 경고
        $window.onbeforeunload = function() {
            if ($scope.beforeUnload) { return '이 페이지를 벗어나시면 작성 중인 글이 지워집니다.'; }
        };
        // 페이지 이동 시 벗어나기 경고
        $scope.$on('$locationChangeStart', function(event, next, current) {
            if ($scope.beforeUnload && !$window.confirm('이 페이지를 벗어나시면 작성 중인 글이 지워집니다.\n\n이 페이지를 벗어나시겠습니까?')) {
                event.preventDefault();
            }
        });
    }
]);

controllers.controller('BoardViewCtrl', ['$scope', '$sce', '$location', '$anchorScroll', '$timeout', 'Alert', 'Board', 'initData',
    function($scope, $sce, $location, $anchorScroll, $timeout, Alert, Board, initData) {
        var view = initData.view;
            view.boardId = view.data.board;
            view.writeId = view.data._id;
            view.data.content = $sce.trustAsHtml(view.data.content);
            
        $scope.skin      = '/views/board/'+view.skin+'/view';
        $scope.view      = view.data;
        $scope.isOwner   = view.isOwner;
        $scope.isWrite   = view.isWrite;
        $scope.isComment = view.isComment;
        $scope.coPage    = view.coPage;

        $scope.comment = Board.initComment();

        $scope.remove = function() { // 게시글 삭제
            Alert.confirm('한번 삭제한 자료는 복구할 수 없습니다.\n\n정말 삭제하시겠습니까?').then(function() {
                var boardId = view.boardId;
                view.$delete(function() {
                    delete $scope.view;
                    Alert.accent('게시글이 삭제되었습니다.');
                    $location.path('/board/' + boardId);
                });
            });
        };

        $scope.saveComment = function() {
            if ($scope.comment.commentId) { // 댓글 수정
                $scope.comment.$update(function(data) {
                    $scope.view.comments[$scope.actionIndex].content = data.content;
                    $scope.resetComment();
                    Alert.accent('댓글이 수정되었습니다.');
                    $location.hash('c'+data._id);
                });
            } else { // 댓글 등록
                $scope.comment.$save(function(data) {
                    data.isOwner = true;
                    if ($scope.actionIndex) { // 답글
                        $scope.view.comments.splice($scope.actionIndex+1, 0, data);
                    } else {
                        $scope.view.comments.push(data)
                    }

                    $scope.resetComment();
                    Alert.accent('댓글이 등록되었습니다.');
                    $location.hash('c'+data._id);
                });
            }
        };

        $scope.replyComment = function(item, index) {
            $scope.resetComment();
            $scope.comment.reply = item._id;
            $scope.action = 'reply';
            $scope.actionIndex = index;
        };

        $scope.modifyComment = function(item, index) {
            $scope.comment.commentId = item._id;
            angular.extend($scope.comment, item);
            $scope.action = 'modify';
            $scope.actionIndex = index;
        };

        $scope.resetComment = function() {
            $scope.comment = Board.initComment();
            $scope.action = $scope.actionIndex = null;
        };

        $scope.removeComment = function(item, index) { // 댓글 삭제
            Alert.confirm('한번 삭제한 자료는 복구할 수 없습니다.\n\n정말 삭제하시겠습니까?').then(function() {
                $scope.comment.commentId = item._id;
                $scope.comment.$delete(function() {
                    delete $scope.comment;
                    $scope.view.comments.splice(index, 1);
                    $scope.comment = Board.initComment();
                    Alert.accent('댓글이 삭제되었습니다.');
                    $location.hash('c'+item._id);
                });
            });
        };

        $scope.pageChanged = function(page) {
            if (!page) { // first
                page = 1;
            } else if (page < 2) { // prev, next
                page = parseInt($scope.coPage.current) + page;
            }

            Board.listComment({ page: page }).then(function(data) {
                $scope.view.comments = data.list;
                $scope.coPage = data.page;
            });
        };

        $timeout(function() { // 댓글 바로가기 #c01
            $anchorScroll();
        }, 500);
    }
]);
