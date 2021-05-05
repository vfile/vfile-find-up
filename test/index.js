/**
 * @typedef {import('vfile').VFile} VFile
 */

import fs from 'fs'
import path from 'path'
import test from 'tape'
import {findUp, findUpOne, INCLUDE, BREAK} from '../index.js'

var join = path.join
/**
 * @type {(...args: string[]) => string}
 */
var base = join.bind(null, process.cwd())

var deepest = base('test', 'fixture', 'foo', 'bar', 'baz')

try {
  fs.unlinkSync('package-lock.json')
} catch {}

test('findUpOne', function (t) {
  t.plan(13)

  findUpOne('package.json', function (_, file) {
    t.deepEqual(
      check(file),
      ['package.json'],
      '`directory` should default to CWD'
    )
  })

  findUpOne('package.json').then((file) => {
    t.deepEqual(check(file), ['package.json'], 'should support promises')
  })

  findUpOne('package.json', deepest, function (_, file) {
    t.deepEqual(check(file), ['package.json'], 'should search for one file')
  })

  findUpOne('package.json', join(deepest, 'qux', 'quux'), function (_, file) {
    t.deepEqual(
      check(file),
      ['package.json'],
      'should ignore unreadable directories'
    )
  })

  findUpOne('.json', deepest, function (_, file) {
    t.deepEqual(
      check(file),
      [join('test', 'fixture', 'foo.json')],
      'should search for an extension'
    )
  })

  findUpOne(
    function (file) {
      return file.stem === 'quux'
    },
    deepest,
    function (_, file) {
      t.deepEqual(
        check(file),
        [join('test', 'fixture', 'foo', 'bar', 'quux.md')],
        'should search for a function'
      )
    }
  )

  findUpOne('.test', deepest, function (_, file) {
    t.deepEqual(
      check(file),
      [join('test', 'fixture', '.test')],
      'should search for a hidden file'
    )
  })

  findUpOne('.md', deepest, function (_, file) {
    t.deepEqual(
      check(file),
      [join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md')],
      'should search for the closest file'
    )
  })

  findUpOne(['.md', '.json'], deepest, function (_, file) {
    t.deepEqual(
      check(file),
      [join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md')],
      'should search for multiple tests'
    )
  })

  findUpOne('!', deepest, function (_, file) {
    t.equal(file, null, 'should pass `null` when not found #1')
  })

  findUpOne(['!', '?'], deepest, function (_, file) {
    t.equal(file, null, 'should pass `null` when not found #2')
  })

  findUpOne(
    function (file) {
      if (file.stem === 'foo') {
        return INCLUDE
      }
    },
    deepest,
    function (_, file) {
      t.deepEqual(
        check(file),
        [join('test', 'fixture', 'foo')],
        'should support `INCLUDE`'
      )
    }
  )

  findUpOne(
    function (file) {
      if (file.stem === 'foo') {
        return BREAK
      }
    },
    deepest,
    function (_, file) {
      t.deepEqual(check(file), [null], 'should support `BREAK`')
    }
  )
})

test('findUp', function (t) {
  t.plan(11)

  findUp('package.json', function (_, files) {
    t.deepEqual(
      check(files),
      ['package.json'],
      '`directory` should default to CWD'
    )
  })

  findUp('package.json').then(function (files) {
    t.deepEqual(check(files), ['package.json'], 'should support promises')
  })

  findUp('package.json', deepest, function (_, files) {
    t.deepEqual(
      check(files),
      ['package.json'],
      'should return files by name and extension'
    )
  })

  findUp('package.json', join(deepest, 'qux', 'quux'), function (_, files) {
    t.deepEqual(
      check(files),
      ['package.json'],
      'should ignore unreadable directories'
    )
  })

  findUp('.json', deepest, function (_, files) {
    t.deepEqual(
      check(files),
      [join('test', 'fixture', 'foo.json'), 'package.json', 'tsconfig.json'],
      'should return files by extension'
    )
  })

  findUp(
    function (file) {
      return file.stem.charAt(0) === 'q'
    },
    deepest,
    function (_, files) {
      t.deepEqual(
        check(files),
        [
          join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md'),
          join('test', 'fixture', 'foo', 'bar', 'quux.md'),
          join('test', 'fixture', 'foo', 'quuux.md'),
          join('test', 'fixture', 'quuuux.md')
        ],
        'should return files by a test'
      )
    }
  )

  findUp('.test', deepest, function (_, files) {
    t.deepEqual(
      check(files),
      [join('test', 'fixture', '.test')],
      'should return hidden files'
    )
  })

  findUp(['.json', '.md'], deepest, function (_, files) {
    t.deepEqual(
      check(files),
      [
        join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md'),
        join('test', 'fixture', 'foo', 'bar', 'quux.md'),
        join('test', 'fixture', 'foo', 'quuux.md'),
        join('test', 'fixture', 'foo.json'),
        join('test', 'fixture', 'quuuux.md'),
        'package.json',
        'readme.md',
        'tsconfig.json'
      ],
      'should search for multiple tests'
    )
  })

  findUp('!', deepest, function (_, files) {
    t.deepEqual(
      check(files),
      [],
      'should return an empty array when not found #1'
    )
  })

  findUp(['?', '!'], deepest, function (_, files) {
    t.deepEqual(
      check(files),
      [],
      'should return an empty array when not found #2'
    )
  })

  findUp(
    function (file) {
      var mask = 0

      if (file.stem.charAt(0) === 'q') {
        mask = INCLUDE
      }

      if (file.stem === 'quuux') {
        mask |= BREAK
      }

      return mask
    },
    deepest,
    function (_, files) {
      t.deepEqual(
        check(files),
        [
          join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md'),
          join('test', 'fixture', 'foo', 'bar', 'quux.md'),
          join('test', 'fixture', 'foo', 'quuux.md')
        ],
        'should support `INCLUDE` and `BREAK`'
      )
    }
  )
})

/**
 * Utility to ensure no outbound files are included, and to strip the CWD from
 * paths.
 *
 * @param {Array.<VFile>|VFile|null} files
 * @returns {Array.<string>}
 */
function check(files) {
  if (files === null) {
    return [null]
  }

  return (Array.isArray(files) ? files : [files])
    .map((file) => file.path)
    .filter((filePath) => filePath.indexOf(base()) === 0)
    .map((filePath) => filePath.slice(base().length + 1))
}
