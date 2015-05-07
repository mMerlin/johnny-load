'use strict';
/* jslint maxlen: 100 */

var assert = require('assert');
var MockFirmata = require('./util/mock-firmata');
var five = require('johnny-five');
var Board = five.Board;
var board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });
var johnny_load = require('../lib/johnny-load.js');
console.log(board.id);// Prevent lint 'board' defined, not used failure
var propertyCheck = function (actual, expected, context) {
  /* jshint maxcomplexity: 14 */
  var i, p, aType, eType;
  // console.log('start propertyCheck for', context);
  // if (context === 'model') { console.log(actual); }

  aType = typeof actual;
  eType = typeof expected;
  if (aType !== eType) {
    throw new Error('expected "' + context + '" datatype ' + eType +
      ', actual is ' + aType);
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      throw new Error('actual "' + context + '" should be an Array');
    }
    assert.strictEqual(actual.length, expected.length,
      'actual length of "' + context + '" Array different than expected');
    for (i = 0; i < expected.length; i += 1) {
      propertyCheck(actual[i], expected[i], context + '[' + i + ']');
    }
    return true;
  }

  if (typeof expected === 'object') {
    if (expected === null) {
      if (actual !== null) {
        throw new Error('actual "' + context + '" expected to be null');
      }
    } else if (actual === null) {
      throw new Error('actual "' + context + '" should not be null');
    }
    for (p in expected) {
      if (expected.hasOwnProperty(p)) {
        if (!actual.hasOwnProperty(p)) {
          throw new Error('expected "' + context + '.' + p +
            '" property does not exist in actual');
        }
        propertyCheck(actual[p], expected[p], context + '.' + p);
      }
    }
    return true;
  }

  if (actual !== expected) {
    throw new Error('actual "' + context + '" value does not match expected');
  }
  return true;
};

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

  Assert module documentaton
  https://nodejs.org/docs/v0.4.2/api/assert.html
*/

exports['empty'] = {
  setUp: function (done) {

    done();
  },
  'no arguments': function (test) {
    test.expect(1);

    test.throws(function () {
      return johnny_load();
    }, function (err) {
      return err instanceof Error &&
        err.message === 'Model must be a non-null object';
    }, 'unexpected error');

    test.done();
  },
  'empty model': function (test) {
    test.expect(2);

    var testDescription = {},
      backupDescription = JSON.parse(JSON.stringify(testDescription)),
      model;

    model = johnny_load(testDescription);
    test.deepEqual(model, {}, 'should be empty object.');
    test.deepEqual(testDescription, backupDescription,
      'description should not be modified');

    test.done();
  },
};

exports['single'] = {
  setUp: function (done) {

    done();
  },
  'simple pin': function (test) {
    test.expect(4);

    var testDescription = {
      testPin: {
        class: 'Pin',
        options: {
          pin: 13
        }
      }
    },
      backupDescription = JSON.parse(JSON.stringify(testDescription)),
      model;

    test.doesNotThrow(function () {
      model = johnny_load(testDescription);
    });

    test.doesNotThrow(function () {
      propertyCheck(model, {
        testPin: {
          pin: 13,
          id: null,
          type: 'digital',
          addr: 13,
          freq: 20,
          mode: 1,
          metadata: {}
        }
      }, 'model');
    });

    test.ok(model.testPin instanceof five.Pin, 'testPin should be a Pin class instance');

    test.deepEqual(testDescription, backupDescription,
      'description should not be modified');

    test.done();
  },
  'extended pin': function (test) {
    test.expect(5);

    var testDescription = {
      testPin: {
        class: 'Pin',
        options: {
          pin: 13,
          id: 'Test Pin',
          freq: 127
        },
        label: 'blinker',
        setup: 'high',
        description: 'test autostart blinking pin',
        nesttest: {
          list: [4, 5, 10],
          obj: {
            prop1: 'first',
            prop2: 'second'
          }
        }
      }
    },
      backupDescription = JSON.parse(JSON.stringify(testDescription)),
      model;

    test.doesNotThrow(function () {
      model = johnny_load(testDescription);
    });

    test.doesNotThrow(function () {
      propertyCheck(model, {
        testPin: {
          pin: 13,
          id: 'Test Pin',
          type: 'digital',
          addr: 13,
          freq: 127,
          metadata: {
            label: 'blinker',
            description: 'test autostart blinking pin',
            nesttest: {
              list: [4, 5, 10],
              obj: {
                prop1: 'first',
                prop2: 'second'
              }
            }
          }
        }
      }, 'model');
    });

    test.equal(model.testPin.setup, undefined,
      'setup property should not exist');
    test.equal(model.testPin.metadata.setup, undefined,
      'setup property should not exist');

    test.deepEqual(testDescription, backupDescription,
      'description should not be modified');

    test.done();
  },
};

/* Samples using the various structures for test.throws()

test.throws(function () {
  return johnny_load();
});

test.throws(function () {
  return johnny_load();
}, Error);

test.throws(function () {
  return johnny_load();
}, undefined, 'should throw an error');

test.throws(function () {
  return johnny_load();
}, Error, 'should throw an error');

test.throws(function () {
  return johnny_load();
}, function (err) {
  return err instanceof Error &&
    err.message === 'Model must be a non-null object';
}, 'unexpected error');

*/
