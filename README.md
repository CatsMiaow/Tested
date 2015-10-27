# Tested
[MEAN](https://en.wikipedia.org/wiki/MEAN_(software_bundle)) Stack 기반에 [Angular Material](https://material.angularjs.org) UI를 적용한 게시판 소스입니다.

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

#### 데이터 폴더 생성
```
+-- public
|   +-- data
|   |   +-- file
|   |   |   +-- notice
|   |   |   +-- talk
|   |   +-- temp
```

### 샘플 게시판 생성
```json
/* 0: 회원가입 후 User level을 10으로 조정해야 글쓰기 가능 */
{
    "_id" : "notice",
    "title" : "공지사항",
    "commentCount" : 0,
    "writeCount" : 0,
    "skin" : "basic",
    "commentLevel" : 1,
    "writeLevel" : 10,
    "readLevel" : 1,
    "listLevel" : 1
}
/* 1: 비회원 쓰기 기능은 없음 */
{
    "_id" : "talk",
    "title" : "자유게시판",
    "commentCount" : 0,
    "writeCount" : 0,
    "skin" : "basic",
    "commentLevel" : 2,
    "writeLevel" : 2,
    "readLevel" : 1,
    "listLevel" : 1
}
```

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
