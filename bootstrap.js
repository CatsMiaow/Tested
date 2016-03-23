'use strict';

var express = require('express');
var fs = require('fs');
var config = require('./server/config');

// https://github.com/isaacs/node-glob ?
module.exports = function () {
  var walk = function (router, pass) {
    var path = this.path;

    fs.readdirSync(path).forEach(function (file) {
      var newPath = path + '/' + file;
      var stat = fs.statSync(newPath);

      if (stat.isFile()) {
        if (/(.*)\.(js$|coffee$)/.test(file)) {
          if (router) { // load routes
            require(newPath)(router, pass);
          } else { // load models
            require(newPath);
          }
        }
      } else if (stat.isDirectory()) { // stat.isDirectory() && file !== 'orderFolder'
        walk.call({ path: newPath }, router, pass);
      }
    });
  };

  var app = express();
  var service;

  // Models Load, Passport에서 Model을 사용하므로 Express 전에 불러와야 함
  walk.call({ path: config.path.cwd + '/server/models' });
  // return [router, pass]
  service = require(config.path.cwd + '/server/config/express')(app);
  // Routes Load
  walk.apply({ path: config.path.cwd + '/server/routes' }, service);

  return app;
};
