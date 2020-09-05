#!/usr/bin/env node

import { spawn } from 'child_process'
import { readFile, unlink, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import minimist from 'minimist'
import { basename, join } from 'path'
import { pack } from './src/pack.js'
import { roll } from './src/roll.js'
import { hashObject } from './src/hash.js'


const ADVICE = "shakediff: Try 'shakediff --help' for more information."
const HELP = `
NAME:

    shakediff - shake an es6 module for named exports and diff the result

SYNOPSIS:

    shakediff [options] <module file> <export list>

OPTIONS:

    -b {rollup|webpack}, --bundler={rollup|webpack}
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
    console.error(`shakediff: missing filename\n${ADVICE}`)
    return 2
  }
  else if (exports.length < 1) {
    console.error(`shakediff: missing export list\n${ADVICE}`)
    return 2
  }


  const moduleCode = await readFile(modulePath, { encoding: 'utf-8' })
  const testCode = scaffoldTest(exports)
  const bundle = bundler == 'rollup' ? roll : pack
  const shakenCode = await bundle(moduleCode, testCode)
  const buffer = Buffer.from(shakenCode, 'utf8')
  const shorthash = hashObject(buffer).slice(0, 6)
  const tempPath = join(tmpdir(), `${shorthash}_${basename(modulePath)}`)
  await writeFile(tempPath, buffer)
  const exitCode = await spiff(tool, modulePath, tempPath)
  await unlink(tempPath)

  return exitCode
}


async function spiff(tool, pathA, pathB) {
  const [ command, ...args ] = tool.split(' ')
  return new Promise((resolve, reject) => {
    spawn(command, [ ...args, pathA, pathB ], { stdio: 'inherit' })
      .once('error', reject)
      .once('close', resolve)
  })
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


function scaffoldTest(exports) {
  const exportList = exports.join(', ')
  return `import { ${exportList} } from 'moduleCode'; export { ${exportList} }`
}


main(process.argv).then(process.exit)
  .catch(console.error).then(() => process.exit(1))
