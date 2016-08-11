import Common from './CommonCtrl';
import Main from './MainCtrl';
import * as User from './UserCtrl';
import * as Board from './BoardCtrl';


export default angular.module('controllers', [])
  .controller('Common', Common)
  .controller('Main', Main)
  .controller('UserList', User.List)
  .controller('UserView', User.View)
  .controller('BoardList', Board.List)
  .controller('BoardWrite', Board.Write);
