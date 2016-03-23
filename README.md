# Tested
[MEAN](https://en.wikipedia.org/wiki/MEAN_(software_bundle)) Stack 기반에 [Angular Material](https://material.angularjs.org) UI를 적용한 게시판 소스입니다.
> DEMO http://tested.co.kr:8001<br/>
> apiDoc http://irc.tested.co.kr/apidoc

<br/>

#### 설치
```javascript
// 1. back-end에서 사용되는 node_modules 설치
$ npm install // --production
// 2. front-end에서 사용되는 node_modules 설치
$ cd public/
$ npm install
// 3. front-end의 모듈 폴더명을 vendor로 변경
$ mv node_modules/ vendor/
// 4. front-end 빌드
$ npm install -g webpack
$ webpack // -p
```


#### 이슈
TinyMCE 에디터의 한글 언어팩을 추가해야 합니다. [다운로드](http://archive.tinymce.com/i18n/download.php?download=ko)<br/>
그리고 CommonJS에서 TinyMCE 에디터가 호환되지 않는 [문제](https://github.com/tinymce/tinymce-dist/issues/11#issuecomment-148003131)가 있습니다.
```javascript
// 한글 언어팩 추가
public/vendor/tinymce/langs/ko.js

// public/vendor/tinymce.js, tinymce.min.js
// 맨 마지막 끝 코드를 this에서 window로 수정

// before
})(this);

// after
})(window);
```


#### 관리자 / 기본 게시판 생성
http://domain.com:8000/init
> 관리자 아이디, 공지사항, 일반게시판 추가<br/>
> [init function](server/controllers/index.js#L62) 참고하여 수정 후 실행<br/>

###### 관리자 페이지
http://domain.com:8000/admin
> 관리자 로그인 후 접속, 게시판 및 사용자 관리


#### Front-End

###### 빌드
```javascript
// webpack.config.js 참고
$ webpack // -p
//> manifest.json
//> public/bundle-*.js
//> private/admin/bundle-*.js
````

###### 배포
관리자 로그인 후 http://domain.com:8000/deploy 실행
> 빌드 시 생성된 manifest.json 설정 기준으로 bundle 파일 교체 수행


#### Custom Style 추가
```jade
//- public/css/*.css, view/index.jade - 11 line
link(rel="stylesheet" type="text/css" href="/css/style.css")
```


#### 폴더 구조
```javascript
+-- front // AngularJS 클라이언트
|   +-- admin // 관리자
|   +-- service // 사용자 
+-- private // 비공개 리소스
|   +-- admin // 관리자 전용
+-- public // 공개 리소스
|   +-- css // style.css
|   +-- data // 파일 폴더
|   |   +-- file // 게시판별 파일 
|   |   +-- temp // 임시 파일
+-- server // Node.js 서버
+-- test // Mocha API test
+-- views // Jade template
```


#### 서버 구동
```javascript
$ node server.js // PORT=1234 NODE_ENV=localhost
```


#### API Tests
```javascript
$ NODE_ENV=test node server.js
$ npm test
```


#### API 문서
```javascript
$ npm install -g apidoc
$ apidoc -i ./server/ -o ../apidoc/
//> ../apidoc/index.html 실행
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
