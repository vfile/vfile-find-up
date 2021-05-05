/**
 * @typedef {import('vfile').VFile} VFile
 * @typedef {string|Assert|Array.<string|Assert>} Test
 * @typedef {(file: VFile) => number|boolean|void} Assert
 */

import fs from 'fs'
import path from 'path'
import {toVFile} from 'to-vfile'

export const INCLUDE = 1
export const BREAK = 4

export const findUp =
  /**
   * @type {{
   *   (test: Test, cwd: string, callback: (error: Error|null, files: Array.<VFile>) => void): void
   *   (test: Test, callback: (error: Error|null, files: Array.<VFile>) => void): void
   *   (test: Test, cwd?: string): Promise.<Array.<VFile>>
   * }}
   */
  (
    /**
     * Find a files or directories upwards.
     *
     * @param {Test} test
     * @param {string} cwd
     * @param {(error: Error|null, files: Array.<VFile>) => void} callback
     * @returns {unknown}
     */
    function (test, cwd, callback) {
      return find(test, cwd, callback)
    }
  )

export const findUpOne =
  /**
   * @type {{
   *   (test: Test, cwd: string, callback: (error: Error|null, file?: VFile) => void): void
   *   (test: Test, callback: (error: Error|null, file?: VFile) => void): void
   *   (test: Test, cwd?: string): Promise.<VFile>
   * }}
   */
  (
    /**
     * Find a file or a directory upwards.
     *
     * @param {Test} test
     * @param {string} cwd
     * @param {(error: Error|null, file?: VFile) => void} callback
     * @returns {unknown}
     */
    function (test, cwd, callback) {
      return find(test, cwd, callback, true)
    }
  )

/**
 * Find applicable files.
 *
 * @param {Test} test
 * @param {string|((error: Error|null, result?: VFile|Array.<VFile>) => void)} cwd
 * @param {null|undefined|((error: Error|null, result?: VFile|Array.<VFile>) => void)} cb
 * @param {boolean} [one]
 * @returns {Promise.<VFile|Array.<VFile>>}
 */
function find(test, cwd, cb, one) {
  /** @type {Array.<VFile>} */
  var results = []
  /** @type {string} */
  var current
  /** @type {Assert} */
  var assert = convert(test)
  /** @type {string} */
  var base
  /** @type {(error: Error|null, result?: VFile|Array.<VFile>) => void} */
  var callback

  if (typeof cwd === 'string') {
    base = cwd
    callback = cb
  } else {
    base = null
    callback = cwd
  }

  current = base ? path.resolve(base) : process.cwd()

  if (!callback) {
    return new Promise(executor)
  }

  executor(resolve)

  /**
   * @param {VFile|Array.<VFile>} result
   */
  function resolve(result) {
    callback(null, result)
  }

  /**
   * @param {(x: VFile|Array.<VFile>) => void} resolve
   */
  function executor(resolve) {
    once(current)

    /**
     * Test a file and check what should be done with the resulting file.
     *
     * @param {string} filePath
     * @returns {boolean}
     */
    function handle(filePath) {
      var file = toVFile(filePath)
      var result = Number(assert(file))

      if ((result & INCLUDE) === INCLUDE) {
        if (one) {
          resolve(file)
          return true
        }

        results.push(file)
      }

      if ((result & BREAK) === BREAK) {
        resolve(one ? null : results)
        return true
      }
    }

    /**
     * Check one directory.
     *
     * @param {string} child
     * @returns {void}
     */
    function once(child) {
      if (handle(current) === true) {
        return
      }

      fs.readdir(current, function (error, entries) {
        var index = -1
        /** @type {string} */
        var entry

        if (error) {
          entries = []
        }

        while (++index < entries.length) {
          entry = entries[index]

          if (
            entry !== child &&
            handle(path.resolve(current, entry)) === true
          ) {
            return
          }
        }

        child = current
        current = path.dirname(current)

        if (current === child) {
          resolve(one ? null : results)
          return
        }

        once(path.basename(child))
      })
    }
  }
}

/**
 * Convert `test`
 *
 * @param {Test} test
 * @returns {Assert}
 */
function convert(test) {
  return typeof test === 'function'
    ? test
    : typeof test === 'string'
    ? testString(test)
    : multiple(test)
}

/**
 * Check multiple tests.
 *
 * @param {Array.<string|Assert>} test
 * @returns {Assert}
 */
function multiple(test) {
  /** @type {Array.<Assert>} */
  var tests = []
  var index = -1

  while (++index < test.length) {
    tests[index] = convert(test[index])
  }

  return check

  /** @type {Assert} */
  function check(file) {
    var index = -1
    /** @type {number|boolean|void} */
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

/**
 * Wrap a string given as a test.
 *
 * @param {string} test
 * @returns {Assert}
 */
function testString(test) {
  return check

  /** @type {Assert} */
  function check(file) {
    return test === file.basename || test === file.extname
  }
}
