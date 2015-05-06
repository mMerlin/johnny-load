'use strict';

var five = require('johnny-five');
var j5Load = require('johnny-load');
var model = {
  sensor1: {
    class: "Sensor",
    options: {
      pin: "A0",
      id: "Moisture Sensor 1",
      freq: 3000
    },
    setup: [
      { scale: [0, 100]},
      { booleanAt: 20 }
    ]
  }
};
new five.Board().on('ready', function () {
  this.children = j5Load(this, model);
});
