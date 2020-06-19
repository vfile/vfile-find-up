'use strict'

var fs = require('fs')
var path = require('path')
var test = require('tape')
var findUp = require('..')

var join = path.join
var base = join.bind(null, process.cwd())

var deepest = base('test', 'fixture', 'foo', 'bar', 'baz')

try {
  fs.unlinkSync('package-lock.json')
} catch (_) {}

test('findUp.one', function (t) {
  t.plan(12)

  findUp.one('package.json', function (error, file) {
    t.deepEqual(
      check(file),
      ['package.json'],
      '`directory` should default to CWD'
    )
  })

  findUp.one('package.json', deepest, function (error, file) {
    t.deepEqual(check(file), ['package.json'], 'should search for one file')
  })

  findUp.one('package.json', join(deepest, 'qux', 'quux'), function (
    error,
    file
  ) {
    t.deepEqual(
      check(file),
      ['package.json'],
      'should ignore unreadable directories'
    )
  })

  findUp.one('.json', deepest, function (error, file) {
    t.deepEqual(
      check(file),
      [join('test', 'fixture', 'foo.json')],
      'should search for an extension'
    )
  })

  findUp.one(
    function (file) {
      return file.stem === 'quux'
    },
    deepest,
    function (error, file) {
      t.deepEqual(
        check(file),
        [join('test', 'fixture', 'foo', 'bar', 'quux.md')],
        'should search for a function'
      )
    }
  )

  findUp.one('.test', deepest, function (error, file) {
    t.deepEqual(
      check(file),
      [join('test', 'fixture', '.test')],
      'should search for a hidden file'
    )
  })

  findUp.one('.md', deepest, function (error, file) {
    t.deepEqual(
      check(file),
      [join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md')],
      'should search for the closest file'
    )
  })

  findUp.one(['.md', '.json'], deepest, function (error, file) {
    t.deepEqual(
      check(file),
      [join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md')],
      'should search for multiple tests'
    )
  })

  findUp.one('!', deepest, function (error, file) {
    t.equal(file, null, 'should pass `null` when not found #1')
  })

  findUp.one(['!', '?'], deepest, function (error, file) {
    t.equal(file, null, 'should pass `null` when not found #2')
  })

  findUp.one(
    function (file) {
      if (file.stem === 'foo') {
        return findUp.INCLUDE
      }
    },
    deepest,
    function (error, file) {
      t.deepEqual(
        check(file),
        [join('test', 'fixture', 'foo')],
        'should support `findUp.INCLUDE`'
      )
    }
  )

  findUp.one(
    function (file) {
      if (file.stem === 'foo') {
        return findUp.BREAK
      }
    },
    deepest,
    function (error, file) {
      t.deepEqual(check(file), [null], 'should support `findUp.BREAK`')
    }
  )
})

test('findUp.all', function (t) {
  t.plan(10)

  findUp.all('package.json', function (error, files) {
    t.deepEqual(
      check(files),
      ['package.json'],
      '`directory` should default to CWD'
    )
  })

  findUp.all('package.json', deepest, function (error, files) {
    t.deepEqual(
      check(files),
      ['package.json'],
      'should return files by name and extension'
    )
  })

  findUp.all('package.json', join(deepest, 'qux', 'quux'), function (
    error,
    files
  ) {
    t.deepEqual(
      check(files),
      ['package.json'],
      'should ignore unreadable directories'
    )
  })

  findUp.all('.json', deepest, function (error, files) {
    t.deepEqual(
      check(files),
      [join('test', 'fixture', 'foo.json'), 'package.json'],
      'should return files by extension'
    )
  })

  findUp.all(
    function (file) {
      return file.stem.charAt(0) === 'q'
    },
    deepest,
    function (error, files) {
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

  findUp.all('.test', deepest, function (error, files) {
    t.deepEqual(
      check(files),
      [join('test', 'fixture', '.test')],
      'should return hidden files'
    )
  })

  findUp.all(['.json', '.md'], deepest, function (error, files) {
    t.deepEqual(
      check(files),
      [
        join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md'),
        join('test', 'fixture', 'foo', 'bar', 'quux.md'),
        join('test', 'fixture', 'foo', 'quuux.md'),
        join('test', 'fixture', 'foo.json'),
        join('test', 'fixture', 'quuuux.md'),
        'package.json',
        'readme.md'
      ],
      'should search for multiple tests'
    )
  })

  findUp.all('!', deepest, function (error, files) {
    t.deepEqual(
      check(files),
      [],
      'should return an empty array when not found #1'
    )
  })

  findUp.all(['?', '!'], deepest, function (error, files) {
    t.deepEqual(
      check(files),
      [],
      'should return an empty array when not found #2'
    )
  })

  findUp.all(
    function (file) {
      var mask = 0

      if (file.stem.charAt(0) === 'q') {
        mask = findUp.INCLUDE
      }

      if (file.stem === 'quuux') {
        mask |= findUp.BREAK
      }

      return mask
    },
    deepest,
    function (error, files) {
      t.deepEqual(
        check(files),
        [
          join('test', 'fixture', 'foo', 'bar', 'baz', 'qux.md'),
          join('test', 'fixture', 'foo', 'bar', 'quux.md'),
          join('test', 'fixture', 'foo', 'quuux.md')
        ],
        'should support `findUp.INCLUDE` and `findUp.BREAK`'
      )
    }
  )
})

// Utility to ensure no outbound files are included, and to strip the CWD from
// paths.
function check(files) {
  if (files === null) {
    return [files]
  }

  return ('length' in files ? files : [files])
    .map(pick)
    .filter(inside)
    .map(relative)

  function pick(file) {
    return file.path
  }

  function inside(filePath) {
    return filePath.indexOf(base()) === 0
  }

  function relative(filePath) {
    return filePath.slice(base().length + 1)
  }
}
