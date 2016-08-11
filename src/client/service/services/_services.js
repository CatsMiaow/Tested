import * as common from './CommonSvc';
import UserSvc from './UserSvc';
import LatestSvc from './LatestSvc';
import BoardSvc from './BoardSvc';


export default angular.module('services', [])
  .factory('httpInterceptor', common.httpInterceptor)
  .service('Alert', common.Alert)
  .service('Resource', common.Resource)
  .service('Session', common.Session)
  .service('Socket', common.Socket)
  .service('User', UserSvc)
  .service('Latest', LatestSvc)
  .service('Board', BoardSvc);
