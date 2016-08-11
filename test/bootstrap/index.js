import chai from 'chai';
import supertest from 'supertest';

import config from '../../src/server/config';

// 테스트 환경변수
process.env.NODE_ENV = 'test';

// 테스트에서 사용할 공통 모듈
global.should = chai.should();
global.request = supertest.agent(`http://localhost:${config.port}/v`);
