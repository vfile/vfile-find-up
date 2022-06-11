# vfile-find-up

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[vfile][] utility to find files by searching the file system upwards.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`findUp(tests[, path][, callback])`](#finduptests-path-callback)
    *   [`findUpOne(tests[, path][, callback])`](#finduponetests-path-callback)
    *   [`function assert(file)`](#function-assertfile)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This utility lets you find one or many files upwards.

## When should I use this?

You can use this utility if you want to find, say, a config file.
If you instead want to find files downwards, such as all markdown files in a
folder, you can use [`vfile-find-down`][vfile-find-down].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, 16.0+, or 18.0+), install with [npm][]:

```sh
npm install vfile-find-up
```

## Use

```js
import {findUp} from 'vfile-find-up'

console.log(await findUp('package.json'))
```

Yields:

```js
[ VFile {
  data: {},
  messages: [],
  history: [ '/Users/tilde/projects/oss/vfile-find-up/package.json' ],
  cwd: '/Users/tilde/projects/oss/vfile-find-up' } ]
```

## API

This package exports the identifiers `findUp`, `findUpOne`, `INCLUDE`, and
`BREAK`.
There is no default export.

### `findUp(tests[, path][, callback])`

Search for `tests` upwards.
Calls callback with either an error or an array of files passing `tests`.

> 👉 **Note**: files are not read (their `value` is not populated).

##### Sigantures

*   `(tests: Test, path?: string, callback: Callback): void`
*   `(tests: Test, path?: string): Promise<Array<VFile>>`

##### Parameters

###### `tests`

Things to search for (`string`, `Function`, or `Array<tests>`).

If a `string` is passed in, the `basename` or `extname` of files must match it
for them to be included.

If an array is passed in, any test must match a given file for it to be
included.

Otherwise, they must be [`Assert`][assert].

###### `path`

Place to searching from (`string`, default: `process.cwd()`).

###### `callback`

Function called with all matching files (`function cb(error[, files])`).

### `findUpOne(tests[, path][, callback])`

Like `findUp`, but either calls `callback` with the first found file or `null`,
or returns a promise that resolved to a file or `null`.

### `function assert(file)`

Check whether a virtual file should be included.
Called with a [vfile][].

##### Returns

*   `true` or `INCLUDE` — include the file in the results
*   `BREAK` — stop searching for files
*   anything else is ignored: the file is not included

The different flags can be combined by using the pipe operator:
`INCLUDE | BREAK`.

## Types

This package is fully typed with [TypeScript][].
It exports the additional types `Assert` and `Test`.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, 16.0+, and 18.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Contribute

See [`contributing.md`][contributing] in [`vfile/.github`][health] for ways to
get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/vfile/vfile-find-up/workflows/main/badge.svg

[build]: https://github.com/vfile/vfile-find-up/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/vfile/vfile-find-up.svg

[coverage]: https://codecov.io/github/vfile/vfile-find-up

[downloads-badge]: https://img.shields.io/npm/dm/vfile-find-up.svg

[downloads]: https://www.npmjs.com/package/vfile-find-up

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/vfile/vfile/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[typescript]: https://www.typescriptlang.org

[contributing]: https://github.com/vfile/.github/blob/main/contributing.md

[support]: https://github.com/vfile/.github/blob/main/support.md

[health]: https://github.com/vfile/.github

[coc]: https://github.com/vfile/.github/blob/main/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[vfile]: https://github.com/vfile/vfile

[vfile-find-down]: https://github.com/vfile/vfile-find-down

[assert]: #function-assertfile
