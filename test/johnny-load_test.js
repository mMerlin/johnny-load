'use strict';

var MockFirmata = require('./util/mock-firmata'),
  five = require('johnny-five'),
  Board = five.Board,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  }),
  johnny_load = require('../lib/johnny-load.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['empty'] = {
  setUp: function(done) {

    done();
  },
  'empty model': function(test) {
    test.expect(1);
    // tests here
    var testModel = {};
    test.deepEqual(johnny_load(board, testModel), {}, 'should be empty object.');
    test.done();
  },
};
