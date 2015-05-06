**Model configuration object structure**

This describes the structure of the object used to model the hardware
configuration, which in turn is used to create the corresponding johnny-five
components.

To make description easier, here is a bit of common context.  This is not part
of the model information, but is part of the context that the configuration
information is used in.
```javascript
'use strict';
var five = require('johnny-five');
var j5Load = require('johnny-load');
var waterModel = require('./water-model.js');
new five.Board().on('ready', function () {
  this.children = j5Load(this, waterModel);
});

```

***The basic model segment***
```javascript
{
  «component_name»: {
    class: "«component_class»",
    options: «component_options»,
    label: "«identifier»",
    setup: «setup_methods»,
    children: «sub_model»,
    include: «import_references»,
    «property_name»: «property_value»  
  },
  «component_name2»: {«as_above…»}
}
```
- «component_name»: required
 - Any valid javascript property name.  This is the name that will
typically be used by the code to access the component.  If you want to be
creative, a quoted string is valid, allowing use of spaces in the name.
Descriptive information is better put in the id property of the options object,
or in custom metadata.
- «component_class»: required
  - Any johnny-five component class constructor function name.  This is entered
in the model as a string, then referenced as five[component_name.class].  That
allows the code to be forward compatible with any components that are added
later, as part of the base johnny-five package, or added by other packages.
As long as it is part of the 'five' instance (or its prototype), johnny-load
can use it.
- «component_options»: required
 - A standard constructor options object for the specified class.  This object
 is passed  directly to the component class constructor function.  IE:
   - container[component_name] = new five[component_name.class]\(component_name.options\);
 - «identifier»: optional
  - Any string.  The label property has a purpose similar to css class names.
It is used as a tag that can be referenced from other places.  It is stored in
the metadata property of the created model.
- setup_methods: optional
 - setup_methods can be a single «setup_method», or an array containing multiple
 «setup_method» entries.
- setup_method:
 - setup_method can be string containing a method name in the prototype chain
for component_class, that does not take any arguments, or
 - setup_method can be an object with a single property that is the name of a
method name in the prototype chain for component_class.  The property value can
be either a single argument value to pass when the method is executed, or and
array containing the argument values to pass.
- sub_model: optional
 - A nested model structure, describing hardware that is (conceptually) grouped
with (part of; controlled by) component_name.
- import_references: optional
 - Only useful in sub models, this allows previously defined components to be
included in current container, making them part of the (control) group for the
parent component.
 - import_references can be either a single string, or an array of strings.
Each reference inserts a duplicate (reference) to the nearest component in the
ancestor tree path, with a matching label.  Like css, labels are cascading.  Any
time mulitple components have the same label, the 'nearest' is used.  Nearest
means being a component of the closed ancestor in the model tree.  Siblings
components are not candidates.  Only direct siblings or direct ancestor
components are candidates.
- property_name: optional
 - Any not explicitly used property is copied to a metadata object in the
created model.  A simple 'deep copy' is used, but it will not handle things like
functions ore circular references.  As long as the value can be converted to
valid JSON, it should work correctly.

***Created Structure***
```javascript
{
  «component_name»: {
    children: «sub_structure»:
    metadata: {
      label: "«identifier»",
      «property_name»: «property_value»:
    }
  },
  «component_name2»: : {«as_above…»}
}
```

- component_name:
 - An instance of a «component_class» johnny-five component, created using the
provided options, and with the extra listed properties.
- sub_structure:
 - An object (possibly empty) with child components for component_name
- metadata:
 - An object (possibly empty) with any extra properties specified in the
hardware model. Any specified label property is included here as well.

Example: Two moisture sensors, with 2 solenoids controlling valves to supply
water, plus a single water pump.  The pump needs to be turned on any time one
of the valves is open, to have pressure to supply the water.  The pump is
initially setup at the 'top' level, but then each of the valve components
includes it as a child component.  That way, when the sensor (event handler)
tells a valve to open, the valve can tell the pump to start as well.  Without
needing to hard-code information for the pump.  This case would be easy to
handle without the extra pump references.  But consider a setup with 4 sensors,
4 valves, and 2 pumps, with each pump associated with 2 of valves.  With that
structure, including the correct pump as a child of the valves means that code
that manages turning the valves on and off can be completely 'generic'.  It will
not need to reference any global information, or make decisions about which pump
to use.  The answer is built directly into the model.
```javascript
{
  pump: {
    class: "Relay",
    options: {
      pin: 5,
      id: "Water Pump",
      type: "NO"
    },
    label: "pressure pump"
  },
  sensor1 : {
    class: "Sensor",
    options: {
      pin: "A0",
      id: "Moisture Sensor 1",
      freq: 60000,
      children: {
        valve: {
          class: "Relay",
          options: {
            pin: 8,
            id: "Solenoid 1",
            type: "NC"
          },
          children: {
            include: "pressure pump"
          }
        }
      }
    }
  },
  sensor2 : {
    class: "Sensor",
    options: {
      pin: "A2",
      id: "Moisture Sensor 2",
      freq: 60000,
      children: {
        valve: {
          class: "Relay",
          options: {
            pin: 4,
            id: "Solenoid 2",
            type: "NC"
          },
          children: {
            include: "pressure pump"
          }
        }
      }
    }
  }
}
```

***setup_method examples***
```javascript
setup: "on"
setup: "{ blink: 500 }"
setup: "{ blink: [500] }"
setup: [
  { scale: [0, 100]},
  { booleanAt: 20 }
]
```
