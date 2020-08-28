#!/usr/bin/env node

import colors from 'colors/safe.js'
import { isatty } from 'tty'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { rollup } from 'rollup'
import virtual from '@rollup/plugin-virtual'

// TODO Replace require with import once jsdiff releases fix
// https://github.com/kpdecker/jsdiff/issues/292
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { structuredPatch } = require('diff')


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
  const stats = chunk.modules[chunk.facadeModuleId]
  const patch = structuredPatch(modulePath, modulePath, moduleCode, chunk.code)

  printPatch(patch, console.log)
}


function printPatch(patch, out = console.log) {
  if (!isatty(1))
    colors.disable()

  let color = colors.bold
  out(color(`--- ${patch.oldFileName}`))
  out(color(`+++ ${patch.newFileName} (shaken)`))
  for (const {oldStart, oldLines, newStart, newLines, lines} of patch.hunks) {
    color = colors.cyan
    out(color(`@@ -${oldStart},${oldLines} +${newStart},${newLines} @@`))
    for (const line of lines) {
      color = line.startsWith('-') ? colors.red
        : line.startsWith('+') ? colors.green
        : colors.reset
      out(color(line))
    }
  }
}


function scaffoldTest(exports) {
  const exportList = exports.join(', ')
  return `import { ${exportList} } from 'moduleCode'; export { ${exportList} }`
}


main(process.argv).catch(console.error)
