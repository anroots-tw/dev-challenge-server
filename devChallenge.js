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
            app.use(`${config.taskRemote}/${task}.js` , express.static(`${config.taskRoot}/${task}/front.js`));
            app.get(`${config.taskRemote}/${task}/data.js` , function(req, res) {
                try {
                    let generator = require(`${config.taskRoot}/${task}/data`);
                    let data = {};
                    if(typeof generator == 'function') {
                        data = generator(req, res);
                    }
                    req.session.data || (req.session.data = {});
                    req.session.data[task] = data;
                    res.send(jsWrapper(data));
                } catch(exception) {
                    if(config.onDataError) {
                        config.onDataError(exception, req, res);
                    } else {
                        console.error(exception);
                        if(exception.code && exception.code == 'MODULE_NOT_FOUND') {
                            res.sendStatus(404);
                        } else {
                            res.sendStatus(500);
                        }
                    }
                }
            });
        }

        // routing
        let urlencodedParser = bodyParser.urlencoded({ extended: true });
        app.post(`${config.apiRoot}/check`, urlencodedParser, function (req, res) {
            try {
                if(!req.body.answer) {
                    return res.json({
                        error: "no answer defined"
                    });
                }

                req.session.data || (req.session.data = {});

                let task = req.body.task || config.tasks[0];
                let nextIndex = config.tasks.indexOf(task) + 1;
                let taskManager = require(`${config.taskRoot}/${task}/back`);

                // check if data is present
                if(taskManager.dataRequired && typeof req.session.data[task] === 'undefined') {
                    return res.json({
                        error: "Lost session? Can't access data."
                    });
                }

                let response = taskManager.check(req.body.answer, req.session.data[task], req, res);

                if(response === true) {
                    config.onSuccess && config.onSuccess(task, answer, req, res);
                    return res.json({
                        next: config.tasks[nextIndex],
                        keyWord : taskManager.keyWord
                    });
                } else {
                    config.onFailure && config.onFailure(task, answer, req, res);
                    return res.json({
                        error: response
                    });
                }
            } catch(exception) {
                if(config.onError) {
                    config.onError(exception, req, res);
                } else {
                    console.error(exception);
                    res.sendStatus(500);
                }
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
                let taskManager = require(`${config.taskRoot}/${task}/back`);

                if(taskManager.keyWord.toLowerCase() == keyword.toLowerCase()) {
                    config.onJumpTo && config.onJumpTo(task, req, res);
                    return res.json({
                        next: task
                    });
                }
            }
            config.onWrongKeword && config.onWrongKeword(task, keyword, req, res);
            return res.json({
                error: 'unknown keyword!'
            });
        });

        return app;
    }
};

function jsWrapper(data) {
    let json = JSON.stringify(data);
    return `define([], function() {return ${json}})`;
}
