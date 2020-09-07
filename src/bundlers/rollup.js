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
  const chunk = output.find(chunk => chunk.facadeModuleId == modulePath)
  return chunk.code
}

export { bundle as rollup }
