'use strict';

var moment = require('moment');
var filters = require('./_filters');

filters.filter('momentFromNow', [function() {
    return function(input) {
        return moment(input).fromNow();
    }
}]);