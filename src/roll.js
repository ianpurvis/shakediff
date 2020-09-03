import { rollup } from 'rollup'
import virtual from '@rollup/plugin-virtual'

async function roll(moduleCode, testCode) {
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

  return chunk.code
}

export { roll }
