import test from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile, stat } from 'node:fs/promises'

test('빌드된 HTML이 스타일시트를 연결한다', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
  const css = await readFile(new URL('../dist/styles.css', import.meta.url), 'utf8')
  assert.match(html, /<link\s+rel="stylesheet"\s+href="\/styles\.css"\s*\/>/)
  assert.match(css, /\.sidebar\s*\{/)
})

test('빌드된 HTML이 favicon을 연결하고 파일을 포함한다', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
  const favicon = await stat(new URL('../dist/favicon.ico', import.meta.url))

  assert.match(html, /<link\s+rel="icon"\s+href="\/favicon\.ico"\s+sizes="any"\s*\/>/)
  assert.ok(favicon.size > 0)
})

test('빌드 결과에 예시 도서가 포함되지 않는다', async () => {
  const seed = JSON.parse(await readFile(new URL('../dist/seed.json', import.meta.url), 'utf8'))
  assert.deepEqual(seed, [])
})

test('클라이언트·서버·빌드 소스가 역할별 폴더에 분리되어 있다', async () => {
  await Promise.all([
    access(new URL('../client/app.ts', import.meta.url)),
    access(new URL('../client/index.html', import.meta.url)),
    access(new URL('../client/styles.css', import.meta.url)),
    access(new URL('../server/server.mjs', import.meta.url)),
    access(new URL('../server/db.mjs', import.meta.url)),
    access(new URL('../scripts/build.mjs', import.meta.url)),
  ])
  await assert.rejects(access(new URL('../app.ts', import.meta.url)))
  await assert.rejects(access(new URL('../server.mjs', import.meta.url)))
})
