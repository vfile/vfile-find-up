'use strict'

var fs = require('fs')
var path = require('path')
var toVFile = require('to-vfile')

exports.INCLUDE = 1
exports.BREAK = 4
exports.one = findOne
exports.all = findAll

// Find a file or a directory upwards.
function findOne(test, cwd, callback) {
  return find(test, cwd, callback, true)
}

// Find files or directories upwards.
function findAll(test, cwd, callback) {
  return find(test, cwd, callback)
}

// Find applicable files.
function find(test, cwd, callback, one) {
  var results = []
  var current

  test = augment(test)

  if (!callback) {
    callback = cwd
    cwd = null
  }

  current = cwd ? path.resolve(cwd) : process.cwd()

  once()

  // Test a file and check what should be done with the resulting file.
  function handle(filePath) {
    var file = toVFile(filePath)
    var result = test(file)

    if ((result & 1) === 1) {
      if (one) {
        callback(null, file)
        return true
      }

      results.push(file)
    }

    if ((result & 4) === 4) {
      callback(null, one ? null : results)
      return true
    }
  }

  // Check one directory.
  function once(child) {
    if (handle(current) === true) {
      return
    }

    fs.readdir(current, onread)

    function onread(error, entries) {
      var index = -1
      var entry

      if (error) {
        entries = []
      }

      while (++index < entries.length) {
        entry = entries[index]

        if (entry !== child && handle(path.resolve(current, entry)) === true) {
          return
        }
      }

      child = current
      current = path.dirname(current)

      if (current === child) {
        callback(null, one ? null : results)
        return
      }

      once(path.basename(child))
    }
  }
}

// Augment `test`
function augment(test) {
  return typeof test === 'function'
    ? test
    : typeof test === 'string'
    ? testString(test)
    : multiple(test)
}

// Check multiple tests.
function multiple(test) {
  var tests = []
  var index = -1

  while (++index < test.length) {
    tests[index] = augment(test[index])
  }

  return check

  function check(file) {
    var index = -1
    var result

    while (++index < tests.length) {
      result = tests[index](file)

      if (result) {
        return result
      }
    }

    return false
  }
}

// Wrap a string given as a test.
function testString(test) {
  return check

  function check(file) {
    return test === file.basename || test === file.extname
  }
}
