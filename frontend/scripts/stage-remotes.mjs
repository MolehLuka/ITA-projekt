import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const remotes = [
  { name: 'members-mfe', target: 'members' },
  { name: 'facilities-mfe', target: 'facilities' },
  { name: 'bookings-mfe', target: 'bookings' },
]

for (const { name, target } of remotes) {
  const src = join(root, name, 'dist')
  const dest = join(root, 'shell', 'public', 'mf', target)
  rmSync(dest, { recursive: true, force: true })
  mkdirSync(dest, { recursive: true })
  cpSync(src, dest, { recursive: true })
  console.log(`staged ${name} -> shell/public/mf/${target}`)
}
