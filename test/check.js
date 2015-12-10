var assert = require('assert');
var endPoints = require('../endPoints');
var mock = require('../mock')();

describe('check endpoint', function() {
    // initialize
    var taskManager = {};
    before(function() {
        endPoints.load = function(path) {
            return taskManager;
        };
    });

    it('throws an error when no answer provided', function() {
        endPoints.check(
            { taskRoot : 'taskRoot' },
            mock.request,
            mock.response
        );

        var json = mock.response.sent.pop();
        var response = JSON.parse(json);

        assert.equal(typeof response.error, 'string');
        assert.equal(response.error, "no answer defined");
    });

    it('throws an error if data is needed but not provided', function() {
        mock.request.body = {
            answer: 'answer'
        };
        taskManager.dataRequired = true;
        endPoints.check(
            {
                taskRoot : 'taskRoot',
                tasks : ['welcome']
            },
            mock.request,
            mock.response
        );

        var json = mock.response.sent.pop();
        var response = JSON.parse(json);

        assert.equal(typeof response.error, 'string');
        assert.equal(response.error, "Lost session? Can't access data.");
    });

    it('passes data to each taskManager correctly', function() {
        mock.request.body = {
            answer: 'answer'
        };
        taskManager.dataRequired = true;
        mock.request.session.data = {welcome : 123};

        var dataPassed;
        taskManager.check = function(answer, data) {
            dataPassed = data;
        };

        endPoints.check(
            {
                taskRoot : 'taskRoot',
                tasks : ['welcome']
            },
            mock.request,
            mock.response
        );

        assert.equal(dataPassed, 123);
    });

    it('returns with custom error if answer is incorrect', function() {
        mock.request.body = {
            answer: 'incorrect answer'
        };

        taskManager.check = function(answer, data) {
            return "custom error message";
        };

        endPoints.check(
            {
                taskRoot : 'taskRoot',
                tasks : ['welcome']
            },
            mock.request,
            mock.response
        );

        var json = mock.response.sent.pop();
        var response = JSON.parse(json);

        assert.equal(response.error, "custom error message");
    });


    it('returns with next task if answer is correct', function() {
        mock.request.body = {
            answer: 'correct answer'
        };

        taskManager.check = function(answer, data) {
            return true;
        };

        endPoints.check(
            {
                taskRoot : 'taskRoot',
                tasks : ['welcome', 'nextTask']
            },
            mock.request,
            mock.response
        );

        var json = mock.response.sent.pop();
        var response = JSON.parse(json);

        assert.equal(response.next, "nextTask");
    });
});
