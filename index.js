'use strict';

var five, board, fullModel, BASE_PROPERTIES, crumbs,
  addSubModel, buildComponent, includeReferences, addNearestMatch;

five = require('johnny-five');
// board is Model scope reference to the board the hardware is attached to

BASE_PROPERTIES = {
  class: "class",
  opts: "opts",
  children: "children"
};

/**
 * Create components needed to interace with board hardware
 *
 * @param {object} model              description of components
 * @return {object}
 */
function loadComponentsForModel(parentBoard, model) {
  // Initialize module level variable use to build the component structure
  board = parentBoard;
  fullModel = {};
  crumbs = [];
  addSubModel(fullModel, model);
  return fullModel;
}

addSubModel = function (container, model) {
  var p;

  if (!(typeof model === 'object' && model !== null)) {
    throw new Error('Model must be a non-null object');
  }

  for (p in model) {
    if (model.hasOwnProperty(p)) {
      if (p !== 'include') {
        if (typeof model[p] !== 'object') {
          throw new Error('Found ' + typeof model[p] + ' property "' + p +
            '" in model');
        }
        crumbs.push(p);
        buildComponent(container, model[p], p);
        crumbs.pop();
      }
    }
  }

  // Add any reference last.  They are not candiates for lower level includes,
  // and only need to check for duplicate properties while processing link
  // references
  if (model.hasOwnProperty('include')) {
    includeReferences(container, model.include);
  }
};

buildComponent = function (container, config, key) {
  /* jshint maxcomplexity: 10 */
  var p, dataType;

  // IDEA: catch and report model configuration errors, or just let it fail?
  if (!config.class) {
    throw new Error('a component model must have a class property');
  }
  if (typeof config.class !== 'string') {
    throw new Error('a component model class name property must be a string');
  }
  if (typeof five[config.class] !== 'function') {
    throw new Error('unknown johnny-five "' + config.class + '" class');
  }
  if (typeof config.opts !== 'object') {
    throw new Error('a component model must have an opts property object');
  }
  config.opts.board = board;
  container[key] = five[config.class](config.opts);
  container[key].metadata = {};

  for (p in config) {
    if (config.hasOwnProperty(p)) {
      if (!BASE_PROPERTIES[p]) {
        dataType = typeof config[p];
        if (dataType !== 'number' && dataType !== 'string') {
          throw new Error('Unhandled datatype ' + dataType +
            ' for component metadata property "' + p + '"');
        }

        container[key].metadata[p] = config[p];
      }
    }
  }

  if (config.children !== undefined) {
    container[key].children = {};
    addSubModel(container[key].children, config.children);
    crumbs.pop();
  }
};

includeReferences = function (container, label) {
  var i;
  if (typeof label === 'string') {
    // Add single reference
    return addNearestMatch(container, label, fullModel, 0, null, null);
  }
  for (i = 0; i < label.length; i += 1) {
    // Add multiple references
    addNearestMatch(container, fullModel, label[i], 0, null, null);
  }
};

addNearestMatch = function (container, label, root, nextCrumb, prvComponent,
    prvProperty) {
  var p, curComponent, curProperty;

  curComponent = prvComponent;// Default to the pervious values
  curProperty = prvProperty;

  // Search the current container (level) for components that match the label
  for (p in root) {
    if (root.hasOwnProperty(p)) {
      if (root[p].metadata.label === label) {
        // Found a matching component
        curComponent = root[p];
        curProperty = p;
      }
    }
  }

  // .length - 1 means do NOT search the container that the link is to be added
  // to.  Stop at the nearest ancestor
  if (nextCrumb >= crumbs.length - 1) {
    // No more levels to search.  Either have the nearest matching reference, or
    // there is none to be found in the 'parent' (ancestor) tree
    if (curComponent === null) {
      throw new Error('No reference found in model for "' + label + '" include');
    }
    if (container[curProperty] !== undefined) {
      throw new Error('container already has a "' + label + '" property');
    }
    // Add a duplicate reference to the matched component
    container[curProperty] = curComponent;
    return;
  }

  // Whether a usable link has been found or not, continue (recursively)
  // searching 'lower' layers, to see if a match is found 'closer' to the target
  // include.  Cascade structure, where 'more specific' or 'later' rules
  // override more general or earlier definitions.

  // Search the child components of the next (lower) layer of the model
  addNearestMatch(container, label, root[crumbs[nextCrumb].children],
    nextCrumb + 1, curComponent, curProperty);
};

module.exports = loadComponentsForModel;
