/**
 * @typedef {import('vfile').VFile} VFile
 */

import assert from 'node:assert/strict'
import path from 'node:path'
import process from 'node:process'
import test from 'node:test'
import {findUp, findUpAll} from '../index.js'

const deepest = path.join(process.cwd(), 'test', 'fixture', 'foo', 'bar', 'baz')

test('core', async function () {
  assert.deepEqual(
    Object.keys(await import('../index.js')).sort(),
    ['findUp', 'findUpAll'],
    'should expose the public api'
  )
})

test('findUp', async function () {
  await new Promise(function (ok) {
    findUp('package.json', function (_, file) {
      assert.deepEqual(
        check(file),
        ['package.json'],
        '`directory` should default to CWD'
      )
      ok(undefined)
    })
  })

  assert.deepEqual(
    check(await findUp('package.json')),
    ['package.json'],
    'should support promises'
  )

  await new Promise(function (ok) {
    findUp('package.json', deepest, function (_, file) {
      assert.deepEqual(
        check(file),
        ['package.json'],
        'should search for one file'
      )
      ok(undefined)
    })
  })

  await new Promise(function (ok) {
    findUp(
      'package.json',
      path.join(deepest, 'qux', 'quux'),
      function (_, file) {
        assert.deepEqual(
          check(file),
          ['package.json'],
          'should ignore unreadable directories'
        )
        ok(undefined)
      }
    )
  })

  await new Promise(function (ok) {
    findUp('.json', deepest, function (_, file) {
      assert.deepEqual(
        check(file),
        [path.join('test', 'fixture', 'foo.json')],
        'should search for an extension'
      )
      ok(undefined)
    })
  })

  await new Promise(function (ok) {
    findUp(
      function (file) {
        return {include: file.stem === 'quux'}
      },
      deepest,
      function (_, file) {
        assert.deepEqual(
          check(file),
          [path.join('test', 'fixture', 'foo', 'bar', 'quux.md')],
          'should search for a function'
        )
        ok(undefined)
      }
    )
  })

  await new Promise(function (ok) {
    findUp('.test', deepest, function (_, file) {
      assert.deepEqual(
        check(file),
        [path.join('test', 'fixture', '.test')],
        'should search for a hidden file'
      )
      ok(undefined)
    })
  })

  await new Promise(function (ok) {
    findUp('.md', deepest, function (_, file) {
      assert.deepEqual(
        check(file),
        [path.join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md')],
        'should search for the closest file'
      )
      ok(undefined)
    })
  })

  await new Promise(function (ok) {
    findUp(['.md', '.json'], deepest, function (_, file) {
      assert.deepEqual(
        check(file),
        [path.join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md')],
        'should search for multiple tests'
      )
      ok(undefined)
    })
  })

  await new Promise(function (ok) {
    findUp('!', deepest, function (_, file) {
      assert.equal(file, undefined, 'should pass `undefined` when not found #1')
      ok(undefined)
    })
  })

  await new Promise(function (ok) {
    findUp(['!', '?'], deepest, function (_, file) {
      assert.equal(file, undefined, 'should pass `undefined` when not found #2')
      ok(undefined)
    })
  })

  await new Promise(function (ok) {
    findUp(
      function (file) {
        return {include: file.stem === 'foo'}
      },
      deepest,
      function (_, file) {
        assert.deepEqual(
          check(file),
          [path.join('test', 'fixture', 'foo')],
          'should support `INCLUDE`'
        )
        ok(undefined)
      }
    )
  })

  await new Promise(function (ok) {
    findUp(
      function (file) {
        return {break: file.stem === 'foo'}
      },
      deepest,
      function (_, file) {
        assert.deepEqual(check(file), [undefined], 'should support `BREAK`')
        ok(undefined)
      }
    )
  })
})

test('findUpAll', async function () {
  await new Promise(function (ok) {
    findUpAll('package.json', function (_, files) {
      assert.deepEqual(
        check(files),
        ['package.json'],
        '`directory` should default to CWD'
      )
      ok(undefined)
    })
  })

  assert.deepEqual(
    check(await findUpAll('package.json')),
    ['package.json'],
    'should support promises'
  )

  await new Promise(function (ok) {
    findUpAll('package.json', deepest, function (_, files) {
      assert.deepEqual(
        check(files),
        ['package.json'],
        'should return files by name and extension'
      )
      ok(undefined)
    })
  })

  await new Promise(function (ok) {
    findUpAll(
      'package.json',
      path.join(deepest, 'qux', 'quux'),
      function (_, files) {
        assert.deepEqual(
          check(files),
          ['package.json'],
          'should ignore unreadable directories'
        )
        ok(undefined)
      }
    )
  })

  await new Promise(function (ok) {
    findUpAll('.json', deepest, function (_, files) {
      assert.deepEqual(
        check(files),
        [
          path.join('test', 'fixture', 'foo.json'),
          'package.json',
          'tsconfig.json'
        ],
        'should return files by extension'
      )
      ok(undefined)
    })
  })

  await new Promise(function (ok) {
    findUpAll(
      function (file) {
        return {include: file.stem !== undefined && file.stem.charAt(0) === 'q'}
      },
      deepest,
      function (_, files) {
        assert.deepEqual(
          check(files),
          [
            path.join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md'),
            path.join('test', 'fixture', 'foo', 'bar', 'quux.md'),
            path.join('test', 'fixture', 'foo', 'quuux.md'),
            path.join('test', 'fixture', 'quuuux.md')
          ],
          'should return files by a test'
        )
        ok(undefined)
      }
    )
  })

  await new Promise(function (ok) {
    findUpAll('.test', deepest, function (_, files) {
      assert.deepEqual(
        check(files),
        [path.join('test', 'fixture', '.test')],
        'should return hidden files'
      )
      ok(undefined)
    })
  })

  await new Promise(function (ok) {
    findUpAll(['.json', '.md'], deepest, function (_, files) {
      assert.deepEqual(
        check(files),
        [
          path.join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md'),
          path.join('test', 'fixture', 'foo', 'bar', 'quux.md'),
          path.join('test', 'fixture', 'foo', 'quuux.md'),
          path.join('test', 'fixture', 'foo.json'),
          path.join('test', 'fixture', 'quuuux.md'),
          'package.json',
          'readme.md',
          'tsconfig.json'
        ],
        'should search for multiple tests'
      )
      ok(undefined)
    })
  })

  await new Promise(function (ok) {
    findUpAll('!', deepest, function (_, files) {
      assert.deepEqual(
        check(files),
        [],
        'should return an empty array when not found #1'
      )
      ok(undefined)
    })
  })

  await new Promise(function (ok) {
    findUpAll(['?', '!'], deepest, function (_, files) {
      assert.deepEqual(
        check(files),
        [],
        'should return an empty array when not found #2'
      )
      ok(undefined)
    })
  })

  await new Promise(function (ok) {
    findUpAll(
      function (file) {
        return {
          include: file.stem ? file.stem.charAt(0) === 'q' : false,
          break: file.stem === 'quuux'
        }
      },
      deepest,
      function (_, files) {
        assert.deepEqual(
          check(files),
          [
            path.join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md'),
            path.join('test', 'fixture', 'foo', 'bar', 'quux.md'),
            path.join('test', 'fixture', 'foo', 'quuux.md')
          ],
          'should support `INCLUDE` and `BREAK`'
        )
        ok(undefined)
      }
    )
  })
})

/**
 * Utility to ensure no outbound files are included, and to strip the CWD from
 * paths.
 *
 * @param {Array<VFile> | VFile | undefined} files
 * @returns {Array<string | undefined>}
 */
function check(files) {
  if (files === undefined) {
    return [undefined]
  }

  return (Array.isArray(files) ? files : [files])
    .map(function (file) {
      return file.path
    })
    .filter(function (filePath) {
      return filePath.indexOf(path.join(process.cwd())) === 0
    })
    .map(function (filePath) {
      return filePath.slice(path.join(process.cwd()).length + 1)
    })
}
