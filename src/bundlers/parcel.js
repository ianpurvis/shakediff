import { readFile, rmdir } from 'fs/promises'
import Bundler from 'parcel'
import { join } from 'path'
import { tmpdir } from '../tmpdir.js'

async function parcel(entryPath, modulePath) {

  const tempDir = join(tmpdir(), 'parcel')

  const bundler = new Bundler(entryPath, {
    autoInstall: false,
    bundleNodeModules: false,
    cache: false,
    contentHash: false,
    detailedReport: false,
    hmr: false,
    logLevel: 2,
    minify: true,
    outDir: tempDir,
    scopeHoist: true,
    target: 'node',
    watch: false,
  })

  try {
    const bundle = await bundler.bundle()
    const shakenCode = await readFile(bundle.name, { encoding: 'utf8' })
    return shakenCode
  }
  finally {
    await rmdir(tempDir, { recursive: true })
  }
}

export { parcel }
