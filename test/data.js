var assert = require('assert');
var endPoints = require('../endPoints');
var mock = require('../mock')();

describe('data endpoint', function() {
    it('should use config to load generator', function() {
        var pathUsed = '';
        endPoints.load = function(path) {
            pathUsed = path;
        };

        endPoints.data(
            { taskRoot : 'taskRoot' },
            'testTask',
            mock.request,
            mock.response
        );

        assert.equal(pathUsed, `taskRoot/testTask/data`);
    });

    it('uses the generator function to get the data and saves it to session', function() {
        testData = { test: 'works' };
        endPoints.load = function(path) {
            return function() {
                return testData;
            }
        };

        endPoints.data(
            { taskRoot : 'taskRoot' },
            'testTask',
            mock.request,
            mock.response
        );

        assert.equal(mock.response.sent.pop(), endPoints.jsWrapper(testData));
        assert.equal(mock.request.session.data.testTask, testData);
    });

});
