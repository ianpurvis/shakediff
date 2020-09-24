import { readFile } from 'fs/promises'
import Bundler from 'parcel'
import { join } from 'path'

async function bundle(entryPath, modulePath, tempDir) {
  const bundler = new Bundler(entryPath, {
    autoInstall: false,
    bundleNodeModules: false,
    cache: false,
    contentHash: false,
    detailedReport: false,
    hmr: false,
    logLevel: 2,
    minify: true,
    outDir: join(tempDir, 'dist'),
    scopeHoist: true,
    target: 'node',
    watch: false,
  })
  const bundle = await bundler.bundle()
  const chunkCode = await readFile(bundle.name, { encoding: 'utf8' })
  return chunkCode
}

export default bundle
