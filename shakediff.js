#!/usr/bin/env node

import { spawn } from 'child_process'
import { createHash } from 'crypto';
import { readFile, unlink, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { basename, join } from 'path'
import { rollup } from 'rollup'
import virtual from '@rollup/plugin-virtual'


async function main(argv) {

  if (argv.length < 4)
    throw 'usage: shakediff <module> <export list>'

  const [ modulePath, ...exports ] = argv.slice(2);
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
  const exitCode = await spiff(modulePath, tempPath)
  await unlink(tempPath)

  return exitCode
}


async function spiff(pathA, pathB) {
  return new Promise((resolve, reject) => {
    spawn('diff', [ pathA, pathB ], { stdio: 'inherit' })
      .once('error', reject)
      .once('close', resolve)
  })
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
