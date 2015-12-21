# dev-challenge-server
Backend of our CLI dev challange.

## Endpoints

The server exposes the following endpoints:

* GET: **/challenge/${challenge}/data.js** - data endpoint for each challenge
* GET: **/challenge/${challenge}.js** - static endpoint for front.js
* POST: **/check** - checks the answer for a specific challenge. Returns with the keyword and the name of the next task if answer was correct or an error with a custom message otherwise.
* GET: **/jumpTo** - jumps to the task after the one which is identified by the keyword provided

