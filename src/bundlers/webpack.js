import memoryfs from 'memory-fs'
import TerserPlugin from 'terser-webpack-plugin'
import webpack from 'webpack'

async function bundle(moduleCode, testCode) {

  // const volume = new memfs.Volume()
  // const fslike = memfs.createFsFromVolume(volume)

  const fslike = new memoryfs()
  const moduleCodePath = '/moduleCode.js'
  const testCodePath = '/testCode.js'
  fslike.writeFileSync(moduleCodePath, moduleCode)
  fslike.writeFileSync(testCodePath, testCode)

  const compiler = webpack({
    entry: testCodePath,
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
          moduleCode: {
            test: moduleCodePath,
            name: 'moduleCode',
            chunks: 'all',
          }
        }
      },
      usedExports: true,
    },
    output: {
      chunkFilename: 'moduleCode.js',
      filename: 'testCode.js',
      path: '/',
    },
    resolve: {
      alias: { moduleCode: moduleCodePath }
    },
    target: 'node',
  })
  compiler.inputFileSystem =
    compiler.outputFileSystem = fslike

  const stats = await new Promise((resolve, reject) => {
    compiler.run((error, stats) =>
      error ? reject(error) : resolve(stats))
  })

  if (stats.hasErrors())
    throw new Error(stats.toJson().errors)

  const chunkCode = fslike.readFileSync(moduleCodePath, { encoding: 'utf8' })

  return chunkCode
}

export { bundle as webpack }
