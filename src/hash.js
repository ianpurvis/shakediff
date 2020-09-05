import { createHash } from 'crypto';

// Simulates git-hash-object (https://stackoverflow.com/q/552659)
function hashObject(buffer) {
  const hash = createHash('sha1')
  hash.update('blob ')
  hash.update(buffer.length.toString())
  hash.update('\0')
  hash.update(buffer)
  return hash.digest('hex')
}

export { hashObject }
