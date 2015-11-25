"use strict";

// var config = require(config);
var express = require('express');
var bodyParser = require('body-parser');

module.exports = {
    spinUp : function(config, _app) {

        let app = _app || express();

        // config defaults
        config.taskRemote || (config.taskRemote = '/challenge');
        config.taskRoot   || (config.taskRoot = 'challenge');
        config.apiRoot    || (config.apiRoot = '');

        // session
        if(config.withSession) {
            let session = require('express-session');
            app.use(session({
                secret: 'what3v3R',
                resave: false,
                saveUninitialized: true
            }));
        }

        // challenges
        for(let task of config.tasks) {
            app.use(`${config.taskRemote}/${task}` , express.static(`${__dirname}/${config.taskRoot}/${task}/front.js`));
            app.get(`${config.taskRemote}/${task}/data` , function(req, res) {
                let generator = require(`${__dirname}/${config.taskRoot}/${task}/data`);
                let data = {};
                if(typeof generator == 'function') {
                    data = generator(req);
                }
                req.session.lastData = data;
                res.json(data);
            });
        }

        // routing
        let urlencodedParser = bodyParser.urlencoded({ extended: true });
        app.post(`${config.apiRoot}/check`, urlencodedParser, function (req, res) {
            if(!req.body.answer) {
                return res.json({
                    error: "no answer defined"
                });
            }

            let task = req.body.task || config.tasks[0];
            let nextIndex = config.tasks.indexOf(task) + 1;
            let taskManager = require(`${__dirname}/${config.taskRoot}/${task}/back`);
            let response = taskManager.check(req.body.answer, req.session.lastData, req, res);

            if(response === true) {
                return res.json({
                    next: config.tasks[nextIndex],
                    keyWord : taskManager.keyWord
                });
            } else {
                return res.json({
                    error: response
                });
            }
        });

        app.get(`${config.apiRoot}/jumpTo`, function(req, res) {
            let keyword = req.query.keyword;

            if(!keyword) {
                return res.json({
                    error: 'missing keyword!'
                });
            }
            for(let task of config.tasks) {
                let taskManager = require(`${__dirname}/${config.taskRoot}/${task}/back`);

                if(taskManager.keyWord.toLowerCase() == keyword.toLowerCase()) {
                    return res.json({
                        next: task
                    });
                }
            }
            return res.json({
                error: 'unknown keyword!'
            });
        });

        return app;
    }
};
