'use strict';

var fs = require('fs');
var path = require('path');
var toVFile = require('to-vfile');

var INCLUDE = 1;
var BREAK = 4;

exports.INCLUDE = INCLUDE;
exports.BREAK = BREAK;
exports.one = findOne;
exports.all = findAll;

var readdir = fs.readdir;
var resolve = path.resolve;
var dirname = path.dirname;
var basename = path.basename;

/* Find a file or a directory upwards. */
function findOne(test, cwd, callback) {
  return find(test, cwd, callback, true);
}

/* Find files or directories upwards. */
function findAll(test, cwd, callback) {
  return find(test, cwd, callback);
}

/* Find applicable files. */
function find(test, cwd, callback, one) {
  var results = [];
  var current;

  test = augment(test);

  if (!callback) {
    callback = cwd;
    cwd = null;
  }

  current = cwd ? resolve(cwd) : process.cwd();

  once();

  /* Test a file and check what should be done with
   * the resulting file. */
  function handle(filePath) {
    var file = toVFile(filePath);
    var result = test(file);

    if (mask(result, INCLUDE)) {
      if (one) {
        callback(null, file);
        return true;
      }

      results.push(file);
    }

    if (mask(result, BREAK)) {
      callback(null, one ? null : results);
      return true;
    }
  }

  /* Check one directory. */
  function once(child) {
    if (handle(current) === true) {
      return;
    }

    readdir(current, onread);

    function onread(err, entries) {
      var length = entries ? entries.length : 0;
      var index = -1;
      var entry;

      if (err) {
        entries = [];
      }

      while (++index < length) {
        entry = entries[index];

        if (entry !== child && handle(resolve(current, entry)) === true) {
          return;
        }
      }

      child = current;
      current = dirname(current);

      if (current === child) {
        callback(null, one ? null : results);
        return;
      }

      once(basename(child));
    }
  }
}

/* Augment `test` */
function augment(test) {
  if (typeof test === 'function') {
    return test;
  }

  return typeof test === 'string' ? testString(test) : multiple(test);
}

/* Check multiple tests. */
function multiple(test) {
  var length = test.length;
  var index = -1;
  var tests = [];

  while (++index < length) {
    tests[index] = augment(test[index]);
  }

  return check;

  function check(file) {
    var result;

    index = -1;

    while (++index < length) {
      result = tests[index](file);

      if (result) {
        return result;
      }
    }

    return false;
  }
}

/* Wrap a string given as a test.
 *
 * A normal string checks for equality to both the filename
 * and extension. A string starting with a `.` checks for
 * that equality too, and also to just the extension. */
function testString(test) {
  return check;

  function check(file) {
    return test === file.basename || test === file.extname;
  }
}

/* Check a mask. */
function mask(value, bitmask) {
  return (value & bitmask) === bitmask;
}
