'use strict';

var Board = require("board-io");
var util = require("util");
// var Emitter = require("events").EventEmitter,
var mockPins = require("./mock-pins");

function MockFirmata(opts) {
  var pins, i;
  Board.call(this, {
    quiet: true
  });

  opts = opts || {};

  this.name = "Mock";

  pins = opts.pins || mockPins.UNO;

  pins.forEach(function (pin) {
    /*jslint nomen: true */
    this._pins.push(pin);
    /*jslint nomen: false */
  }, this);

  // set/override for special cases
  // like AdvancedFirmata
  for (i in opts) {
    /* jshint forin: false */
    /*jslint forin: false */
    this[i] = opts[i];
    /* jshint forin: true */
    /*jslint forin: true */
  }
}

util.inherits(MockFirmata, Board);


MockFirmata.prototype.servoConfig = function () { return; };

module.exports = MockFirmata;
