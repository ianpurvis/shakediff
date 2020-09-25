const KNOWN_BUNDLERS = {
  parcel: '@shakediff/bundler-parcel',
  rollup: '@shakediff/bundler-rollup',
  webpack: '@shakediff/bundler-webpack'
}

async function load(specifier) {
  specifier = KNOWN_BUNDLERS[specifier] || specifier
  const bundler = await import(specifier).catch(() => undefined)
  if (!bundler) {
    throw `shakediff: cannot find bundler package '${specifier}'`
  }
  else if (!bundler.default) {
    throw `shakediff: cannot find default export for bundler package '${specifier}'`
  }
  return bundler.default
}

export { load }
