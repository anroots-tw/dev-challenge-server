var assert = require('assert');
var endPoints = require('../endPoints');
var mock = require('../mock')();

describe('jumpTo endpoint', function() {

    it('throws an error when no keyword provided', function() {
        endPoints.jumpTo(
            { taskRoot : 'taskRoot' },
            mock.request,
            mock.response
        );

        var json = mock.response.sent.pop();
        var response = JSON.parse(json);

        assert.equal(typeof response.error, 'string');
        assert.equal(response.error, "missing keyword!");
    });

    it('throws an error when no keyword not found', function() {
        mock.request.query = {keyword : 'ize'};
        endPoints.load = function(path) {
            return { keyWord : 'nope' };
        };
        endPoints.jumpTo(
            {
                taskRoot : 'taskRoot',
                tasks : ['one', 'two']
            },
            mock.request,
            mock.response
        );

        var json = mock.response.sent.pop();
        var response = JSON.parse(json);

        assert.equal(typeof response.error, 'string');
        assert.equal(response.error, "unknown keyword!");
    });

    it('returns with the next task if keyword found', function() {
        mock.request.query = {keyword : 'two'};
        var tasks = [{ keyWord : 'one' }, { keyWord : 'two' }, { keyWord : 'three' }].reverse();

        endPoints.load = function(path) {
            return tasks.pop();
        };
        endPoints.jumpTo(
            {
                taskRoot : 'taskRoot',
                tasks : ['one', 'two', 'three']
            },
            mock.request,
            mock.response
        );

        var json = mock.response.sent.pop();
        var response = JSON.parse(json);

        assert.equal(response.next, "three");
    });
});
