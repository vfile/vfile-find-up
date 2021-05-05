import fs from 'fs'
import path from 'path'
import {toVFile} from 'to-vfile'

export const INCLUDE = 1
export const BREAK = 4

// Find a file or a directory upwards.
export function findUpOne(test, cwd, callback) {
  return find(test, cwd, callback, true)
}

// Find files or directories upwards.
export function findUp(test, cwd, callback) {
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
