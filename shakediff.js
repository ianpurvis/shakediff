#!/usr/bin/env node

import { mkdir, rmdir, writeFile } from 'fs/promises'
import minimist from 'minimist'
import { basename, join, relative, resolve } from 'path'
import { parcel } from './src/bundlers/parcel.js'
import { rollup } from './src/bundlers/rollup.js'
import { webpack } from './src/bundlers/webpack.js'
import { hashObject } from './src/hash.js'
import { scaffoldEntry } from './src/scaffold.js'
import { spiff } from './src/spiff.js'
import { tmpdir } from './src/tmpdir.js'


const ADVICE = "shakediff: Try 'shakediff --help' for more information."
const HELP = `
NAME:

    shakediff - shake an es6 module for named exports and diff the result

SYNOPSIS:

    shakediff [options] <module file> <export list>

OPTIONS:

    -b {parcel|rollup|webpack}, --bundler={parcel|rollup|webpack}
        Choose a bundler. Default is "rollup".

    -t <tool>, --tool=<tool>
        Diff with the specified <tool>. Default is "diff".

    -h, --help
        Display this help and exit.

EXAMPLES:

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
`.trimStart()

const BUNDLERS = {
  parcel,
  rollup,
  webpack
}

async function main(argv) {

  const {
    _: [
      modulePath,
      ...exports
    ],
    help,
    bundler,
    tool,
    ...unknown
  } = parseArgs(argv)

  for (const option in unknown) {
    console.error(`shakediff: invalid option '${option}'\n${ADVICE}`)
    return 2
  }
  if (help) {
    console.log(HELP)
    return 0
  }
  else if (!modulePath) {
    console.error(`shakediff: missing module file\n${ADVICE}`)
    return 2
  }
  else if (exports.length < 1) {
    console.error(`shakediff: missing export list\n${ADVICE}`)
    return 2
  }
  else if (!BUNDLERS[bundler]) {
    console.error(`shakediff: invalid bundler '${bundler}'\n${ADVICE}`)
    return 2
  }

  const tempDir = tmpdir()
  await mkdir(tempDir)

  try {
    // Node import specifiers may not start with '/'
    const moduleSpecifier = relative(tempDir, modulePath)

    const entryCode = scaffoldEntry(moduleSpecifier, exports)
    const entryBuffer = Buffer.from(entryCode, 'utf8')
    const entryHash = hashObject(entryBuffer).slice(0, 6)
    const entryPath = join(tempDir, `${entryHash}_entry.js`)
    await writeFile(entryPath, entryBuffer)

    const shakenCode = await BUNDLERS[bundler](entryPath, modulePath, tempDir)
    const shakenBuffer = Buffer.from(shakenCode, 'utf8')
    const shakenHash = hashObject(shakenBuffer).slice(0, 6)
    const shakenPath = join(tempDir, `${shakenHash}_${basename(modulePath)}`)
    await writeFile(shakenPath, shakenBuffer)

    const exitCode = await spiff(tool, modulePath, shakenPath)
    return exitCode
  }
  finally {
    await rmdir(tempDir, { recursive: true })
  }
}

function parseArgs(argv) {
  const options = {
    alias: {
      b: 'bundler',
      h: 'help',
      t: 'tool',
    },
    boolean: [
      'help',
    ],
    default: {
      bundler: 'rollup',
      tool: 'diff'
    },
    string: [
      'bundler',
      'tool'
    ],
  }
  const args = minimist(argv.slice(2), options)

  for (const alias in options.alias) delete args[alias]

  return args
}


main(process.argv).then(process.exit)
  .catch(console.error).then(() => process.exit(1))
