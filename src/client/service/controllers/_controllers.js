import Common from './CommonCtrl';
import Main from './MainCtrl';
import * as User from './UserCtrl';
import * as Board from './BoardCtrl';


export default angular.module('controllers', [])
  .controller('Common', Common)
  .controller('Main', Main)
  .controller('UserJoin', User.Join)
  .controller('UserModify', User.Modify)
  .controller('UserLogin', User.Login)
  .controller('BoardList', Board.List)
  .controller('BoardWrite', Board.Write)
  .controller('BoardView', Board.View);
