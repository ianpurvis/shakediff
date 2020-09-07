import { spawn } from 'child_process'

// Spawn diff.
async function spiff(tool, pathA, pathB) {
  const [ command, ...args ] = tool.split(' ')
  return new Promise((resolve, reject) => {
    spawn(command, [ ...args, pathA, pathB ], { stdio: 'inherit' })
      .once('error', reject)
      .once('close', resolve)
  })
}

export { spiff }
