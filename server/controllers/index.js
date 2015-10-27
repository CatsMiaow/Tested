'use strict';

var indexControllers = {
    render: function(req, res) {
        res.render('index');
    },
    views: function(req, res) {
        res.render(req.params[0]);
    },
    session: function(req, res) {
        res.json(req.user);
    },
    health: function(req, res) {
        res.status(200).send(new Buffer(JSON.stringify({
            pid: process.pid,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        })));
    },
    html5Mode: function(req, res, next) {
        if (req.path.indexOf('/v/') === 0) { // API 주소 통과, req.query.t
            return next();
        }
        
        res.render('index');
    }
};


module.exports = indexControllers;