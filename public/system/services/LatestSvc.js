'use strict';

var services = require('./_services');

services.factory('Latest', ['Resource', '$route', '$q',
    function(Resource, $route, $q) {
        var latest = {};

        latest.conn = Resource('latest/:type/:id/:controller', {
            type      : '@type',
            id        : '@id',
            controller: '@controller'
        });

        latest.query = function(param) {
            var delay = $q.defer();

            var config = { // 기본값
                limit: 5
            };
            angular.extend(config, param);
            
            latest.conn.query(config, function(result) {
                delay.resolve(result);
            }, function() {
                delay.reject('Execution Error - Latest');
            });

            return delay.promise;
        };

        return latest;
    }
]);
