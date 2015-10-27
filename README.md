# Tested
[MEAN](https://en.wikipedia.org/wiki/MEAN_(software_bundle)) Stack 기반에 [Angular Material](https://material.angularjs.org) UI를 적용한 게시판 소스입니다.
> DEMO http://tested.co.kr:8001

<br/>

#### 모듈 설치
```javascript
// back-end에서 사용되는 node_modules 설치
$ npm install
// front-end에서 사용되는 node_modules 설치
$ cd public/
$ npm install
// front-end의 모듈 폴더명 변경
$ mv node_modules/ vendor/
```

#### 이슈
tinymce 에디터의 한글 언어팩을 추가해야 합니다. [다운로드](http://www.tinymce.com/i18n/download.php?download=ko)<br/>
그리고 browserify에서 tinymce 에디터가 호환되지 않는 [문제](https://github.com/tinymce/tinymce-dist/issues/11#issuecomment-148003131)가 있습니다.
```javascript
// public/vendor/tinymce.js, tinymce.min.js
// 맨 마지막 끝 코드를 this에서 window로 수정해야 합니다.

// before
})(this);

// after
})(window);
```

#### 데이터 폴더 생성
```
+-- public
|   +-- data
|   |   +-- file
|   |   |   +-- notice
|   |   |   +-- talk
|   |   +-- temp
```

#### 기본 데이터 생성
http://domain.com:8001/init 실행
> 공지사항, 일반게시판, 관리자 아이디 추가<br/>
> [init function](server/controllers/index.js#L27) 소스 참고

#### 빌드
```javascript
// 개발 용도의 browserify bundle 생성, build.js 참고
// public/bundle.js
$ node build
// 배포 용도의 bundle 생성, gulpfile.js 참고
// manifest.json, public/bundle-*
$ npm install -g gulp
$ gulp
```

#### 파일 로드
```jade
//- Build bundle.js, views/index.jade - end line
script(src="bundle.js" type="text/javascript")
//- Custome style.css, view/index.jade - 11 line
link(rel="stylesheet" type="text/css" href="/css/style.css")
```

#### 실행
```javascript
$ NODE_ENV=localhost node server.js
```
<br/>

###### Required Database
* [MongoDB](https://www.mongodb.org)
* [Redis](http://www.redis.io)


###### MEAN Stack Components, https://en.wikipedia.org/wiki/MEAN_(software_bundle)
* MongoDB with [Mongoose](http://mongoosejs.com)
* [Express](http://expressjs.com)
* [AngularJS](https://angularjs.org) with [Angular Material](https://material.angularjs.org)
* [NodeJS](https://nodejs.org)
