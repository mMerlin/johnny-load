'use strict';

var five = require('johnny-five');
var j5Load = require('johnny-load');
var model = {
  blinker: {
    class: "Led",
    options: {
      pin: 13
    },
    setup: { blink: 500 }
  }
};
new five.Board().on('ready', function () {
  this.children = j5Load(model);
});
