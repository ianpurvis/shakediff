#!/usr/bin/env node

import { spawn } from 'child_process'
import { createHash } from 'crypto';
import { readFile, unlink, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import minimist from 'minimist'
import { basename, join } from 'path'
import { rollup } from 'rollup'
import virtual from '@rollup/plugin-virtual'

const ADVICE = "shakediff: Try 'shakediff --help' for more information."
const HELP = `
NAME:

    shakediff - shake an es6 module for named exports and diff the result

SYNOPSIS:

    shakediff [options] <module file> <export list>

OPTIONS:

    -t <tool>, --tool=<tool>
        Diff with the specified <tool>. Default is "diff".

    -h, --help
        Display this help and exit.

EXAMPLES:

    Shake module.mjs for "foo"

        $ shakediff module.mjs foo

    Shake module.mjs for "foo" and "bar":

        $ shakediff module.mjs foo bar

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

  const { _: [ modulePath, ...exports ], help, tool, ...unknown } = parseArgs(argv)

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
  const bundle = await rollup({
    input: 'testCode',
    plugins: [
      virtual({
        moduleCode,
        testCode
      })
    ],
    treeshake: true
  })
  const { output } = await bundle.generate({
    format: 'esm',
    preserveModules: true
  })
  const chunk = output.find(chunk => chunk.name == '_virtual:moduleCode')
  const chunkBuffer = Buffer.from(chunk.code, 'utf8')
  const chunkHash = sha1(chunkBuffer).slice(0, 6)
  const tempPath = join(tmpdir(), `${chunkHash}_${basename(modulePath)}`)
  await writeFile(tempPath, chunkBuffer)
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
      h: 'help',
      t: 'tool',
    },
    boolean: [
      'help',
    ],
    default: {
      tool: 'diff'
    },
    string: [
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


function sha1(buffer) {
  // Simulates git-hash-object (https://stackoverflow.com/q/552659)
  const hash = createHash('sha1')
  hash.update('blob ')
  hash.update(buffer.length.toString())
  hash.update('\0')
  hash.update(buffer)
  return hash.digest('hex')
}


main(process.argv).then(process.exit)
  .catch(console.error).then(() => process.exit(1))
