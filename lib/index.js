/**
 * @callback Assert
 *   Handle a file.
 * @param {VFile} file
 *   File to handle.
 * @returns {boolean | null | number | undefined}
 *   How to handle this file.
 *
 *   `true` is treated as `INCLUDE`.
 *
 * @callback Callback
 *   Callback called when done finding one file.
 * @param {Error | undefined} error
 *   Error.
 *
 *   > 👉 **Note**: Errors are currently never passed
 * @param {VFile | undefined} [file]
 *   File.
 * @returns {undefined}
 *   Nothing.
 *
 * @callback CallbackAll
 *   Callback called when done.
 * @param {Error | undefined} error
 *   Error.
 *
 *   > 👉 **Note**: Errors are currently never passed.
 * @param {Array<VFile> | undefined} [files]
 *   Files.
 * @returns {undefined}
 *   Nothing.
 *
 * @typedef {Array<Assert | string> | Assert | string} Test
 *   Things to search for.
 *
 *   For strings, the `basename` or `extname` of files must match them.
 *   For arrays, any test in them must match.
 */

// Note: using callback style is likely faster here as we could walk into tons
// of folders.
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import {VFile} from 'vfile'

// To do: use `URL`?
// To do: next major: rename to `findUpAll`?

/**
 * Include this file.
 */
export const INCLUDE = 1

/**
 * Stop searching.
 */
export const BREAK = 4

/**
 * Find the first file or folder upwards.
 *
 * > 👉 **Note**: files are not read (their `value` is not populated).
 *
 * @overload
 * @param {Test} test
 * @param {string | null | undefined} path
 * @param {Callback} callback
 * @returns {undefined}
 *
 * @overload
 * @param {Test} test
 * @param {Callback} callback
 * @returns {undefined}
 *
 * @overload
 * @param {Test} test
 * @param {string | null | undefined} [path]
 * @returns {Promise<VFile | undefined>}
 *
 * @param {Test} test
 *   Things to search for.
 * @param {Callback | string | null | undefined} [path]
 *   Place to search from (default: `process.cwd()`).
 * @param {Callback | null | undefined} [callback]
 *   Callback called when done (default: `undefined`).
 * @returns {Promise<VFile | undefined> | undefined}
 *   Nothing when `callback` is given, otherwise a promise that resolves to
 *   a file or `undefined`.
 */
export function findUp(test, path, callback) {
  /** @type {Callback | null | undefined} */
  let callbackOne
  /** @type {Promise<Array<VFile>>} */
  let promise

  if (typeof path === 'function') {
    callbackOne = path
    promise = find(test, undefined, true)
  } else {
    callbackOne = callback
    promise = find(test, path || undefined, true)
  }

  if (!callbackOne) {
    return promise.then(pickFirst)
  }

  promise.then(function (files) {
    // @ts-expect-error: `callbackOne` is defined.
    callbackOne(undefined, pickFirst(files))
    return files
  }, callbackOne)
}

/**
 * Find files or folders upwards.
 *
 * > 👉 **Note**: files are not read (their `value` is not populated).
 *
 * @overload
 * @param {Test} test
 * @param {string | null | undefined} path
 * @param {CallbackAll} callback
 * @returns {undefined}
 *
 * @overload
 * @param {Test} test
 * @param {CallbackAll} callback
 * @returns {undefined}
 *
 * @overload
 * @param {Test} test
 * @param {string | null | undefined} [path]
 * @returns {Promise<Array<VFile>>}
 *
 * @param {Test} test
 *   Things to search for.
 * @param {CallbackAll | string | null | undefined} [path]
 *   Place to search from (default: `process.cwd()`).
 * @param {CallbackAll | null | undefined} [callback]
 *   Callback called when done (default: `undefined`).
 * @returns {Promise<Array<VFile>> | undefined}
 *   Nothing when `callback` is given, otherwise a promise that resolves to
 *   files.
 */
export function findUpAll(test, path, callback) {
  /** @type {CallbackAll | null | undefined} */
  let callbackAll
  /** @type {Promise<Array<VFile>>} */
  let promise

  if (typeof path === 'function') {
    callbackAll = path
    promise = find(test, undefined, false)
  } else {
    callbackAll = callback
    promise = find(test, path || undefined, false)
  }

  if (!callbackAll) {
    return promise
  }

  promise.then(function (files) {
    // @ts-expect-error: `callbackAll` is defined.
    callbackAll(undefined, files)
    return files
  }, callbackAll)
}

/**
 * Convert `test`
 *
 * @param {Test} test
 *   Test.
 * @returns {Assert}
 *   Assert.
 */
function convert(test) {
  return typeof test === 'function'
    ? test
    : typeof test === 'string'
    ? convertString(test)
    : convertTests(test)
}

/**
 * Wrap a string given as a test.
 *
 * @param {string} test
 *   Basename or extname.
 * @returns {Assert}
 *   Assert.
 */
function convertString(test) {
  return check

  /** @type {Assert} */
  function check(file) {
    return test === file.basename || test === file.extname
  }
}

/**
 * Check multiple tests.
 *
 * @param {Array<Assert | string>} test
 *   Tests.
 * @returns {Assert}
 *   Assert.
 */
function convertTests(test) {
  /** @type {Array<Assert>} */
  const tests = []
  let index = -1

  while (++index < test.length) {
    tests[index] = convert(test[index])
  }

  return assert

  /** @type {Assert} */
  function assert(file) {
    let index = -1

    while (++index < tests.length) {
      const result = tests[index](file)

      if (result) {
        return result
      }
    }

    return false
  }
}

/**
 * Find files.
 *
 * @param {Test} test
 *   Things to search for.
 * @param {string | undefined} base
 *   Place to search from.
 * @param {boolean} one
 *   Stop at one file.
 * @returns {Promise<Array<VFile>>}
 *   Promise that resolves to files.
 */
async function find(test, base, one) {
  const assert = convert(test)
  /** @type {Array<VFile>} */
  const results = []

  let current = base ? path.resolve(base) : process.cwd()

  // @ts-expect-error: `undefined` is fine instead of `void`.
  return new Promise(executor)

  /**
   * @param {(files: Array<VFile>) => undefined} resolve
   *   Resolve callback.
   * @returns {undefined}
   *   Nothing.
   */
  function executor(resolve) {
    once(current)

    /**
     * Test a file and check what should be done with the resulting file.
     *
     * @param {string} filePath
     * @returns {boolean | undefined}
     */
    function handle(filePath) {
      const file = new VFile({path: filePath})
      const result = Number(assert(file))

      if ((result & INCLUDE) === INCLUDE) {
        if (one) {
          resolve([file])
          return true
        }

        results.push(file)
      }

      if ((result & BREAK) === BREAK) {
        resolve(one ? [] : results)
        return true
      }
    }

    /**
     * Check one directory.
     *
     * @param {string} child
     * @returns {undefined}
     */
    function once(child) {
      if (handle(current) === true) {
        return
      }

      fs.readdir(current, function (error, entries) {
        let index = -1

        if (error) {
          entries = []
        }

        while (++index < entries.length) {
          const entry = entries[index]

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
          resolve(one ? [] : results)
          return
        }

        once(path.basename(child))
      })
    }
  }
}

/**
 * Get the first item.
 *
 * @template {unknown} T
 *   Kind.
 * @param {Array<T>} values
 *   List.
 * @returns {T | undefined}
 *   Head.
 */
function pickFirst(values) {
  return values[0]
}
