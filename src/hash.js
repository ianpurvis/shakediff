import { createHash } from 'crypto';

function hash(string) {
  const hash = createHash('sha1')
  hash.update(string)
  return hash.digest('hex')
}

// Simulates git-hash-object (https://stackoverflow.com/q/552659)
function hashObject(buffer) {
  const hash = createHash('sha1')
  hash.update('blob ')
  hash.update(buffer.length.toString())
  hash.update('\0')
  hash.update(buffer)
  return hash.digest('hex')
}

export { hash, hashObject }
