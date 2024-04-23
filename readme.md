# vfile-find-up

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[vfile][] utility to find files by searching the file system upwards.

## Contents

* [What is this?](#what-is-this)
* [When should I use this?](#when-should-i-use-this)
* [Install](#install)
* [Use](#use)
* [API](#api)
  * [`findUp(test[, path][, callback])`](#finduptest-path-callback)
  * [`findUpAll(test[, path][, callback])`](#findupalltest-path-callback)
  * [`Assert`](#assert)
  * [`Callback`](#callback)
  * [`CallbackAll`](#callbackall)
  * [`Result`](#result)
  * [`Test`](#test)
* [Types](#types)
* [Compatibility](#compatibility)
* [Contribute](#contribute)
* [License](#license)

## What is this?

This utility lets you find one or many files upwards.

## When should I use this?

You can use this utility if you want to find, say, a config file.
If you instead want to find files downwards, such as all markdown files in a
folder, you can use [`vfile-find-down`][vfile-find-down].

## Install

This package is [ESM only][esm].
In Node.js (version 16+), install with [npm][]:

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
VFile {
  cwd: '/Users/tilde/Projects/oss/vfile-find-up',
  data: {},
  history: [ '/Users/tilde/Projects/oss/vfile-find-up/package.json' ],
  messages: []
}
```

## API

This package exports the identifiers [`findUp`][api-find-up] and
[`findUpAll`][api-find-up-all].
There is no default export.

### `findUp(test[, path][, callback])`

Find the first file or folder upwards.

> 👉 **Note**: files are not read (their `value` is not populated).
> use [`to-vfile`][to-vfile] for that.

###### Signatures

* `(test[, path], callback) => undefined`
* `(test[, path]) => Promise<VFile>`

###### Parameters

* `test` ([`Test`][api-test])
  — things to search for
* `path` (`URL` or `string`, default: `process.cwd()`)
  — place to search from
* `callback` ([`Callback`][api-callback], optional)
  — callback called when done

###### Returns

Nothing when `callback` is given (`undefined`), otherwise a promise that
resolves to a file ([`VFile | undefined`][vfile]).

### `findUpAll(test[, path][, callback])`

Find files or folders upwards.

> 👉 **Note**: files are not read (their `value` is not populated).
> use [`to-vfile`][to-vfile] for that.

###### Signatures

* `(test[, path], callback) => undefined`
* `(test[, path]) => Promise<Array<VFile>>`

###### Parameters

* `test` ([`Test`][api-test])
  — things to search for
* `paths` (`URL` or `string`, default: `process.cwd()`)
  — place to search from
* `callback` ([`CallbackAll`][api-callback-all], optional)
  — callback called when done

###### Returns

Nothing when `callback` is given (`undefined`), otherwise a promise that
resolves to files ([`Array<VFile>`][vfile]).

### `Assert`

Handle a file (TypeScript type).

###### Parameters

* `file` ([`VFile`][vfile])
  — file to handle

###### Returns

How to handle this file ([`Result`][api-result], optional).

### `Callback`

Callback called when done finding one file (TypeScript type).

###### Parameters

* `error` (`Error | undefined`)
  — error; errors are currently never passed
* `file` ([`VFile | undefined`][vfile])
  — file

###### Returns

Nothing (`undefined`).

### `CallbackAll`

Callback called when done (TypeScript type).

###### Parameters

* `error` (`Error | undefined`)
  — error; errors are currently never passed
* `files` ([`Array<VFile>`][vfile])
  — files

###### Returns

Nothing (`undefined`).

### `Result`

What to do when collecting a file or folder (TypeScript type).

###### Fields

* `break` (`boolean`, default: `false`)
  — stop searching after this file or folder
* `include` (`boolean`, default: `false`)
  — include this file or folder

### `Test`

Things to search for (TypeScript type).

For strings, the `basename` or `extname` of files must match them.
For arrays, any test in them must match.

###### Type

```ts
type Test = Array<Assert | string> | Assert | string
```

## Types

This package is fully typed with [TypeScript][].
It exports the additional types
[`Assert`][api-assert],
[`Callback`][api-callback],
[`CallbackAll`][api-callback-all],
[`Result`][api-result], and
[`Test`][api-test].

## Compatibility

Projects maintained by the unified collective are compatible with maintained
versions of Node.js.

When we cut a new major release, we drop support for unmaintained versions of
Node.
This means we try to keep the current release line, `vfile-find-up@^7`,
compatible with Node.js 16.

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

[to-vfile]: https://github.com/vfile/to-vfile

[vfile-find-down]: https://github.com/vfile/vfile-find-down

[api-find-up]: #finduptest-path-callback

[api-find-up-all]: #findupalltest-path-callback

[api-assert]: #assert

[api-callback]: #callback

[api-callback-all]: #callbackall

[api-result]: #result

[api-test]: #test
