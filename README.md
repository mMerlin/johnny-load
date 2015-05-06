# johnny-load

Load a model of board hardware to a johnny-five program from a JSON style javascript description object.

This package creates johnny-five components based on properties in a javascript
object.  That object could be loaded from a JSON file, but it (seems) simpler
to use the standard node.js package format, and just export the model from the
package file.  This is intended to support nested component descriptions, so
that the model can include information about the relationship between components.
For example, a sensor can be the parent / wrapper for the components that change
state based on the sensor readings.  Where information from multiple sensors is
combined to control multiple states, the sensors could be combined into a group,
and the group can be configured as the parent for the other controls.

This was initially created to handle the components needed for the
[auto-water](https://github.com/mMerlin/auto-water) project.  Sensors and
relays.  The code structure is such that it **should** work without change for
any currently existing or future johnny-five component.  As long as the component
class constructor function is a property of the 'johnny-five' object, this
package should be able to create instances.

## Getting Started
Install the module with: `npm install johnny-load`

```javascript
var johnny_load = require('johnny-load');
var model = {
  //hardware description information
};
board.children = johnny_load(board, model);
```

## Documentation
./docs/

## Examples
./examples/
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2015 H. Phil Duby
Licensed under the MIT license.
