# shakediff

Shake an es6 module for named exports and diff the result.

## Synopsis:

    shakediff [options] <module file> <export list>

## Options:

    -b {parcel|rollup|webpack}, --bundler={parcel|rollup|webpack}
        Choose a bundler, or use the specified <module>. Default is "rollup".

        Bundlers are not installed by default, please make sure to install one:

            parcel:   @shakediff/bundler-parcel
            rollup:   @shakediff/bundler-rollup
            webpack:  @shakediff/bundler-webpack

        Or provide one with an esm import specifier:

            https://nodejs.org/api/esm.html#esm_import_specifiers

        Any module with the following interface can be used:

            export default async function bundle(entryPath, modulePath, tempDir) {
              return 'bundled module code'
            }

    -t <tool>, --tool=<tool>
        Diff with the specified <tool>. Default is "diff".

    -h, --help
        Display this help and exit.

## Examples:

Shake module.mjs for "foo" using rollup:

    $ shakediff module.mjs foo

Shake module.mjs for "foo" and "bar" using webpack:

    $ shakediff -b webpack module.mjs foo bar

Output a unified diff:

    $ shakediff -t "diff -u" module.mjs foo

Generate a diffstat:

    $ shakediff module.mjs foo | diffstat

View a diff in gvim:

    $ shakediff -t "gvim -df" module.mjs foo

View a histogram diff in git:

    $ shakediff -t "git diff --no-index --histogram" module.mjs foo

## License
This package is available as open source under the terms of the
[MIT License](http://opensource.org/licenses/MIT).

[![https://purvisresearch.com](.logo.svg)](https://purvisresearch.com)
