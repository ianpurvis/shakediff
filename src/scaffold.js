function scaffoldEntry(specifier, exports) {
  const exportList = exports.join(', ')
  return `import { ${exportList} } from '${specifier}'; export { ${exportList} }`
}

export { scaffoldEntry }
