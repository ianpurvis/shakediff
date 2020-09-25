import { realpathSync } from 'fs'
import { tmpdir as _tmpdir } from 'os'
import { resolve } from 'path'
import { pid, hrtime } from 'process'
import { hash } from './hash.js'

const PROCESS_HASH = hash(`${pid}-${hrtime.bigint}`).slice(0, 16)

function tmpdir() {
  return resolve(realpathSync(_tmpdir()), PROCESS_HASH)
}

export { tmpdir }
