# Tested
ECMAScript 6(as ES6/ES2015)으로 작성한 [MEAN](https://en.wikipedia.org/wiki/MEAN_(software_bundle)) Stack 기반의 [Angular Material](https://material.angularjs.org) UI를 적용한 게시판 소스입니다.
> ~~DEMO http://dist.tested.co.kr~~<br/>
> apiDoc http://discord.tested.kr/apidoc

<br/>

#### Node.js
> Node.js 6.x 미만의 버전은 [.babelrc](.babelrc) 설정값을 아래와 같이 수정합니다. 

```json
{
  "presets": "es2015"
}
```


#### 설치
```javascript
// 1. back-end에서 사용되는 node_modules 설치
$ npm install // --production
// 2. front-end에서 사용되는 node_modules 설치
$ cd src/client
$ npm install
// 3. front-end 모듈의 심볼릭 링크 생성
// 3-1. 리눅스
$ cd resource/public
$ ln -s ../../src/client/node_modules/ vendor
// 3-2. 윈도우, cmd 프로그램을 관리자 권한으로 실행
$ mklink /d "C:\Tested\resource\public\vendor" "C:\Tested\src\client\node_modules"
```


#### 초기 세팅
http://domain.com:PORT/init
> 관리자 아이디, 공지사항 / 일반게시판 추가<br/>
> [init function](src/server/controllers/index.js#L60) 설정값 수정 후 실행<br/>

###### 관리자 페이지
http://domain.com:PORT/admin
> 관리자 로그인 후 접속 가능, 게시판 및 사용자 관리


#### Custom Style
```jade
//- resource/public/css/*.css, views/index.jade - 11 line
link(rel="stylesheet" type="text/css" href="/css/style.css")
```


#### 폴더 구조
```javascript
+-- dist // 서버 빌드 파일
+-- logs // 로그
+-- resource // 외부에서 접근할 수 있는 자원
|   +-- private // 비공개 리소스
|   |   +-- admin // 관리자 전용
|   +-- public // 공개 리소스
|   |   +-- css // style.css
|   |   +-- data // 파일 폴더
|   |   |   +-- file // 게시판별 파일 
|   |   |   +-- temp // 임시 파일
|   |   +-- langs // 언어 파일, TinyMCE
|   |   +-- vendor // src\client\node_modules 심볼릭 링크
+-- src // 프로그램 소스
|   +-- client // AngularJS 클라이언트 소스
|   |   +-- admin // 관리자
|   |   +-- service // 사용자
|   +-- server // Node.js 서버 소스
+-- test // Mocha API test
+-- views // Jade template
```


#### 빌드
```javascript
$ NODE_ENV=production npm run build
//> dist/server/**
//> manifest.json
//> resource/public/bundle-*.js
//> resource/private/admin/bundle-*.js
```


#### Front-End 재배포
http://domain.com:PORT/deploy
> 관리자 로그인 후 실행 가능<br/>
> 서버가 구동되어 있는 상태에서 Front-End 소스가 변경되었을 때 사용<br/>
> 빌드 시 생성된 manifest.json 설정 기준으로 bundle 파일 교체 수행


#### 서버 구동
```javascript
$ npm start // PORT=1234 NODE_ENV=localhost
```


#### API Tests
```javascript
$ NODE_ENV=test npm start
$ npm test
```


#### API 문서
```javascript
$ npm install -g apidoc
$ apidoc -i ./src/server/ -o ../apidoc/
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
