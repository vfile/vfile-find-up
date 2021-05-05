# vfile-find-up

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Find [vfile][]s by searching the file system upwards.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install vfile-find-up
```

## Use

```js
import {findUp} from 'vfile-find-up'

findUp('package.json', console.log)
```

Yields:

```js
null [ VFile {
  data: {},
  messages: [],
  history: [ '/Users/tilde/projects/oss/vfile-find-up/package.json' ],
  cwd: '/Users/tilde/projects/oss/vfile-find-up' } ]
```

## API

This package exports the following identifiers: `findUp`, `findUpOne`, `INCLUDE`,
`BREAK`.
There is no default export.

### `findUp(tests[, path], callback)`

Search for `tests` upwards.
Invokes callback with either an error or an array of files passing `tests`.
Note: Virtual Files are not read (their `contents` is not populated).

##### Parameters

###### `tests`

Things to search for (`string`, `Function`, or `Array.<tests>`).

If a `string` is passed in, the `basename` or `extname` of files must match it
for them to be included.

If an array is passed in, any test must match a given file for it to be
included.

Otherwise, they must be [`function`][test].

###### `path`

Place to searching from (`string`, default: `process.cwd()`).

###### `callback`

Function called with all matching files (`function cb(err[, files])`).

### `findUpOne(tests[, path], callback)`

Like `findUp`, but calls `callback` with the first found file, or `null`.

### `function test(file)`

Check whether a virtual file should be included.
Invoked with a [vfile][].

##### Returns

*   `true` or `INCLUDE` — Include the file in the results
*   `BREAK` — Stop searching for files
*   anything else is ignored: the file is not included

The different flags can be combined by using the pipe operator:
`INCLUDE | BREAK`.

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

[contributing]: https://github.com/vfile/.github/blob/HEAD/contributing.md

[support]: https://github.com/vfile/.github/blob/HEAD/support.md

[health]: https://github.com/vfile/.github

[coc]: https://github.com/vfile/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[vfile]: https://github.com/vfile/vfile

[test]: #function-testfile
