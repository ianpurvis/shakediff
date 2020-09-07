function scaffoldEntry(modulePath, exports) {
  const exportList = exports.join(', ')
  return `import { ${exportList} } from '${modulePath}'; export { ${exportList} }`
}

export { scaffoldEntry }
