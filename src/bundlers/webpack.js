import MemoryFileSystem from 'memory-fs'
import { basename, resolve } from 'path'
import TerserPlugin from 'terser-webpack-plugin'
import webpack from 'webpack'

async function bundle(entryPath, modulePath) {

  const chunkFile = basename(modulePath)
  const outputDir = '/'

  const compiler = webpack({
    entry: entryPath,
    optimization: {
      concatenateModules: true,
      minimize: true,
      minimizer: [
        new TerserPlugin({
          sourceMap: false,
          terserOptions: {
            compress: {
              defaults: false,
              dead_code: true,
              keep_classnames: true,
              keep_fargs: true,
              keep_fnames: true,
              keep_infinity: true,
              side_effects: true,
              toplevel: true,
              typeofs: false,
              unsafe_undefined: false,
              unused: true,
            },
            mangle: false,
            output: {
              beautify: true,
              braces: true,
              comments: true,
              keep_numbers: true,
              keep_quoted_props: true,
              preserve_annotations: true,
              quote_style: 3,
              shebang: true,
              wrap_func_args: false
            },
          },
        }),
      ],
      splitChunks: {
        cacheGroups: {
          nonEntry: {
            chunks: 'all',
            filename: chunkFile,
            test(module) {
              return !module.resource.endsWith(entryPath)
            },
          }
        },
        minSize: 0,
      },
      usedExports: true,
    },
    output: {
      path: outputDir
    },
    target: 'node',
  })

  const memfs = new MemoryFileSystem()
  compiler.outputFileSystem = memfs

  const stats = await new Promise((resolve, reject) => {
    compiler.run((error, stats) =>
      error ? reject(error) : resolve(stats))
  })

  if (stats.hasErrors())
    throw new Error(stats.toJson().errors)

  const chunkPath = resolve(outputDir, chunkFile)
  const chunkCode = memfs.readFileSync(chunkPath, { encoding: 'utf8' })
  return chunkCode
}

export { bundle as webpack }
