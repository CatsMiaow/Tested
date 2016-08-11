import express from 'express';
// System.import()와 fs모듈로 폴더별 import 구현 가능 DIY

// Models Load
import './config/mongo'; // MongoDB Connect
import './models/board';
import './models/comment';
import './models/file';
import './models/user';
import './models/visit';
import './models/write';
// Routes Init
import routeAdmin from './routes/admin';
import routeBoard from './routes/board';
import routeIndex from './routes/index';
import routeLatest from './routes/latest';
import routeUpload from './routes/upload';
import routeUser from './routes/user';

import configExpress from './config/express';

const app = express();
const router = configExpress(app); // return [router, pass]
// Routes Load
routeAdmin(...router);
routeBoard(...router);
routeIndex(...router);
routeLatest(...router);
routeUpload(...router);
routeUser(...router);


export default app;
