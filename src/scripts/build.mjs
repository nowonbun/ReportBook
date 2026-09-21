import { stripTypeScriptTypes } from 'node:module'
import { mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const client = join(root, 'client')
const out = join(root, 'dist')
await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })
for (const file of ['app.ts', 'data.ts']) {
  const source = await readFile(join(client, file), 'utf8')
  const javascript = stripTypeScriptTypes(source, { mode: 'strip' })
  await writeFile(join(out, file.replace(/\.ts$/, '.js')), javascript, 'utf8')
}
await writeFile(join(out, 'seed.json'), '[]\n', 'utf8')
for (const file of ['favicon.ico', 'index.html', 'styles.css']) {
  await copyFile(join(client, file), join(out, file))
}
console.log('Built TypeScript site in dist/')
