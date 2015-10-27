'use strict';

var express = require('express')
  , fs = require('fs')
  , appPath = process.cwd();

// https://github.com/isaacs/node-glob ?
module.exports = function(mongo) {
    var walk = function(router, pass) {
        var path = this;
        
        fs.readdirSync(path).forEach(function(file) {
            var newPath = path + '/' + file
              , stat = fs.statSync(newPath);

            if (stat.isFile()) {
                if (/(.*)\.(js$|coffee$)/.test(file)) {
                    if (router) { // load routes
                        require(newPath)(router, pass);
                    } else { // load models
                        require(newPath)
                    }
                }
            } else if (stat.isDirectory()) { // stat.isDirectory() && file !== 'orderFolder'
                walk.call(newPath, router, pass);
            }
        });
    };
    
    // Models Load
    walk.call(appPath + '/server/models');

    // passport에서 model을 사용하므로 express 전에 불러와야 함
    var app = express()
      , service = require(appPath + '/server/config/express')(app, mongo); // return [router, pass]

    // Routes Load
    walk.apply(appPath + '/server/routes', service);

    return app;
};