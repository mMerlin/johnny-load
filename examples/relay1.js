'use strict';

var five = require('johnny-five');
var j5Load = require('johnny-load');
var model = {
  pump: {
    class: "Relay",
    options: {
      pin: 5,
      id: "Water Pump",
      type: "NO"
    },
    label: "Pressure Pump",
    setup: "on"
  }
};
new five.Board().on('ready', function () {
  this.children = j5Load(model);
});
