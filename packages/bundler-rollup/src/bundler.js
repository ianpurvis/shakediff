import { resolve } from 'path'
import { rollup } from 'rollup'

async function bundle(entryPath, modulePath) {
  const bundle = await rollup({
    input: entryPath,
    treeshake: true
  })
  const { output } = await bundle.generate({
    format: 'esm',
    preserveModules: true
  })
  const chunk = output.find(chunk =>
    chunk.facadeModuleId == resolve(modulePath))
  return chunk.code
}

export default bundle
