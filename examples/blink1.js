'use strict';

var five = require('johnny-five');
var j5Load = require('johnny-load');
var model = {
  blinker: {
    class: "Led",
    options: {
      pin: 13
    }
  }
};
new five.Board().on('ready', function () {
  this.children = j5Load(this, model);
  this.children.blinker.blink(500);
});
